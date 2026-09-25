/**
 * Source snapshot adapters (RECOVERY-3).
 *
 * - provider: wraps the legacy provider read-model (memory mode / warm-up).
 * - database: reads source_health + data_sources (postgres mode), falling
 *   back to the provider snapshot while a source was never synced.
 */

import type { SourceSnapshotPort, SourceSnapshot } from '@/server/application/sources/source-service';
import { sourceDisplayName } from '@/server/application/sources/source-service';
import type { LegacyHealthPort } from '@/server/application/sources/source-service';
import type { SourceType } from '@/server/domain/sources/sources.contract';
import { PostgresSourceRepository } from '@/server/infrastructure/repositories/sources/postgres-source-repository';

const TYPE_BY_SOURCE: Record<string, SourceType> = {
  INMET: 'OFFICIAL_WEATHER',
  MOCK: 'DEMO',
};

export function snapshotFromLegacy(
  legacy: ReturnType<LegacyHealthPort['getSourceHealth']>
): SourceSnapshot {
  return {
    id: legacy.source,
    name: sourceDisplayName(legacy.source),
    type: TYPE_BY_SOURCE[legacy.source] ?? 'OFFICIAL_WEATHER',
    status: legacy.status,
    lastAttemptAt: legacy.lastAttemptAt,
    lastSuccessAt: legacy.lastSuccessAt,
    latencyMs: legacy.latencyMs,
    errorCode: legacy.errorCode,
    message: legacy.message,
  };
}

export class ProviderSourceSnapshotPort implements SourceSnapshotPort {
  constructor(private readonly legacy: LegacyHealthPort) {}
  async getHealthSnapshot(): Promise<SourceSnapshot> {
    return snapshotFromLegacy(this.legacy.getSourceHealth());
  }
}

export class DatabaseSourceSnapshotPort implements SourceSnapshotPort {
  constructor(
    private readonly repository: PostgresSourceRepository,
    private readonly fallback: SourceSnapshotPort
  ) {}

  async getHealthSnapshot(): Promise<SourceSnapshot> {
    const code = process.env.ALERT_DATA_MODE === 'official' ? 'INMET' : 'MOCK';
    try {
      const health = await this.repository.getHealthByCode(code);
      if (health) {
        return {
          id: health.id,
          name: health.name,
          type: health.type,
          status: health.status,
          lastAttemptAt: health.lastAttemptAt,
          lastSuccessAt: health.lastSuccessAt,
          latencyMs: health.latencyMs,
          errorCode: health.errorCode,
          message: health.message,
        };
      }
    } catch {
      // DB unreachable for the health read → provider snapshot keeps the
      // read path alive (fail-safe policy, docs/REDIS.md §Fallback).
    }
    return this.fallback.getHealthSnapshot();
  }
}
