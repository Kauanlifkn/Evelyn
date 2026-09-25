/**
 * PostgreSQL source repository (RECOVERY-3).
 * Read/write for data_sources + source_health (latest-state model —
 * decision documented in docs/DATABASE.md §Source health).
 */

import { eq } from 'drizzle-orm';
import { getDb } from '@/server/infrastructure/db/client';
import { dataSources, sourceHealth } from '@/server/infrastructure/db/schema';
import type {
  DataSource,
  SourceHealth,
} from '@/server/domain/sources/sources.contract';
import { nowIso } from '@/server/shared/time';

export interface HealthRow {
  status: 'ONLINE' | 'STALE' | 'OFFLINE';
  lastAttemptAt: Date | null;
  lastSuccessAt: Date | null;
  latencyMs: number | null;
  errorCode: string | null;
  message: string | null;
}

export class PostgresSourceRepository {
  async ensureSource(input: {
    code: string;
    name: string;
    type: string;
    baseUrl?: string | null;
  }): Promise<void> {
    const db = getDb();
    await db
      .insert(dataSources)
      .values({
        code: input.code,
        name: input.name,
        type: input.type,
        baseUrl: input.baseUrl ?? null,
        enabled: true,
      })
      .onConflictDoUpdate({
        target: dataSources.code,
        set: { name: input.name, type: input.type, updatedAt: new Date() },
      });
  }

  async getIdByCode(code: string): Promise<string | null> {
    const db = getDb();
    const rows = await db
      .select({ id: dataSources.id })
      .from(dataSources)
      .where(eq(dataSources.code, code))
      .limit(1);
    return rows[0]?.id ?? null;
  }

  async listSources(): Promise<DataSource[]> {
    const db = getDb();
    const rows = await db.select().from(dataSources);
    return rows.map((r) => ({
      id: r.code,
      name: r.name,
      type: r.type as DataSource['type'],
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  }

  /** Latest health for a source code; null when never synced. */
  async getHealthByCode(code: string): Promise<SourceHealth | null> {
    const db = getDb();
    const rows = await db
      .select({ health: sourceHealth, source: dataSources })
      .from(sourceHealth)
      .innerJoin(dataSources, eq(sourceHealth.sourceId, dataSources.id))
      .where(eq(dataSources.code, code))
      .limit(1);
    if (rows.length === 0) return null;
    const { health, source } = rows[0];
    return {
      id: source.code,
      name: source.name,
      type: source.type as SourceHealth['type'],
      status: health.status as SourceHealth['status'],
      lastAttemptAt: health.lastAttemptAt?.toISOString() ?? null,
      lastSuccessAt: health.lastSuccessAt?.toISOString() ?? null,
      latencyMs: health.latencyMs,
      errorCode: health.errorCode,
      message: health.message,
      createdAt: health.createdAt.toISOString(),
      updatedAt: health.updatedAt.toISOString(),
    };
  }

  /** Upsert the latest health state for a source. */
  async upsertHealth(code: string, row: HealthRow): Promise<void> {
    const db = getDb();
    const sourceId = await this.getIdByCode(code);
    if (!sourceId) {
      throw new Error(`DataSource "${code}" não registrada — rode npm run db:seed.`);
    }
    const values = {
      sourceId,
      status: row.status,
      lastAttemptAt: row.lastAttemptAt,
      lastSuccessAt: row.lastSuccessAt,
      latencyMs: row.latencyMs,
      errorCode: row.errorCode,
      message: row.message,
      updatedAt: new Date(),
    };
    await db
      .insert(sourceHealth)
      .values(values)
      .onConflictDoUpdate({ target: sourceHealth.sourceId, set: values });
  }
}

/** Convenience for logs/tests. */
export function sourceSnapshotStub(): string {
  return nowIso();
}
