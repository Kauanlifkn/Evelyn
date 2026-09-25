/**
 * INMET sync service (RECOVERY-3).
 *
 * Feed INMET → normalize → validate → transaction (upsert + areas) →
 * source health → unlock. Flow: provider → adapter → DB; the API reads
 * the DATABASE, not the feed per request.
 *
 * Concurrency: Redis lock (SET NX PX) prevents two simultaneous syncs;
 * TTL guarantees no permanent deadlock. Without Redis, an in-process
 * flag prevents overlap in the same instance.
 *
 * Logs (no PII): source.sync_started / source.sync_completed /
 * source.sync_failed with counters and durationMs.
 */

import { logger } from '@/server/infrastructure/observability/logger';
import { getRedis } from '@/server/infrastructure/redis/client';
import { InmetAlertSource } from '@/server/infrastructure/providers/alerts/inmet-alert-adapter';
import { getInmetProvider } from '@/server/providers/alerts/inmet-provider';
import { PostgresAlertRepository } from '@/server/infrastructure/repositories/alerts/postgres-alert-repository';
import { PostgresSourceRepository } from '@/server/infrastructure/repositories/sources/postgres-source-repository';
import type { Alert, AlertSourcePort } from '@/server/domain/alerts/alert.contract';

const LOCK_KEY = 'lock:sync:inmet';
const LOCK_TTL_MS = 60_000;

export interface SyncResult {
  ran: boolean;
  reason?: 'lock-held';
  countReceived: number;
  countActive: number;
  inserted: number;
  updated: number;
  durationMs: number;
}

let inProcessSyncRunning = false;

export async function syncInmetAlerts(): Promise<SyncResult> {
  const source = new InmetAlertSource(getInmetProvider());
  return performSync(source);
}

/**
 * Testable core: takes any alert source (the real INMET adapter in
 * production; deterministic fakes in integration tests — the automated
 * suite never touches the real feed).
 */
export async function performSync(
  source: AlertSourcePort,
  sourceCode = source.id
): Promise<SyncResult> {
  const startedAt = Date.now();
  const redis = getRedis();
  const stats: SyncResult = {
    ran: false,
    countReceived: 0,
    countActive: 0,
    inserted: 0,
    updated: 0,
    durationMs: 0,
  };

  // ── Lock (Redis NX; in-process fallback) ─────────────────────────────
  let lockAcquired = false;
  if (redis) {
    try {
      if (redis.status !== 'ready') await redis.connect();
      const set = await redis.set(LOCK_KEY, '1', 'PX', LOCK_TTL_MS, 'NX');
      lockAcquired = set === 'OK';
    } catch {
      logger.warn('redis.error', { event_detail: 'sync_lock_fallback' });
    }
  }
  if (!redis || !lockAcquired) {
    if (inProcessSyncRunning) {
      logger.warn('source.sync_skipped', { reason: 'lock-held' });
      return { ...stats, reason: 'lock-held' };
    }
    inProcessSyncRunning = true;
  }

  try {
    logger.info('source.sync_started', { source: sourceCode });

    // ── Fetch + normalize ─────────────────────────────────────────────
    const alerts: Alert[] = await source.fetchAlerts();
    stats.countReceived = alerts.length;
    stats.countActive = alerts.filter((a) => a.status === 'active').length;

    // ── Persist (upsert dedupe source+externalId, areas in tx) ────────
    const alertRepo = new PostgresAlertRepository();
    const { inserted, updated } = await alertRepo.upsertAlerts(sourceCode, alerts);
    stats.inserted = inserted;
    stats.updated = updated;

    // ── Source health ──────────────────────────────────────────────────
    const sourceRepo = new PostgresSourceRepository();
    await sourceRepo.upsertHealth(sourceCode, {
      status: 'ONLINE',
      lastAttemptAt: new Date(),
      lastSuccessAt: new Date(),
      latencyMs: stats.durationMs || null,
      errorCode: null,
      message: `sync ok: ${stats.countReceived} avisos recebidos`,
    });

    stats.ran = true;
    stats.durationMs = Date.now() - startedAt;
    logger.info('source.sync_completed', {
      source: sourceCode,
      countReceived: stats.countReceived,
      countActive: stats.countActive,
      inserted: stats.inserted,
      updated: stats.updated,
      durationMs: stats.durationMs,
    });
    return stats;
  } catch (error) {
    stats.durationMs = Date.now() - startedAt;
    logger.error('source.sync_failed', {
      source: sourceCode,
      durationMs: stats.durationMs,
      detail: error instanceof Error ? error.message : 'unknown',
    });
    throw error;
  } finally {
    // ── Unlock (best-effort; TTL is the hard safety net) ───────────────
    if (redis) {
      try {
        if (redis.status === 'ready') await redis.del(LOCK_KEY);
      } catch {
        // TTL expires in ≤60s — no permanent deadlock.
      }
    }
    inProcessSyncRunning = false;
  }
}
