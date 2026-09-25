/**
 * PostgreSQL alert repository (RECOVERY-3).
 *
 * Read port used by AlertService + write side used by the INMET sync
 * (upsert keyed by source+external_id — doc §21 dedupe rule).
 * Alert + areas are written atomically in a transaction.
 */

import { and, asc, desc, eq, gt, isNull, or, sql } from 'drizzle-orm';
import { getDb } from '@/server/infrastructure/db/client';
import {
  alertAreas,
  alerts,
  dataSources,
} from '@/server/infrastructure/db/schema';
import type {
  Alert,
  AlertFilter,
  AlertOrigin,
  AlertSeverity,
  AlertStatus,
} from '@/server/domain/alerts/alert.contract';
import type { PageMeta, PaginationQuery } from '@/server/shared/pagination';

export interface AlertUpsertResult {
  inserted: number;
  updated: number;
}

export interface AlertListResult {
  items: Alert[];
  meta: PageMeta;
}

const alertColumns = {
  id: alerts.id,
  externalId: alerts.externalId,
  sourceCode: dataSources.code,
  sourceType: alerts.sourceType,
  origin: alerts.origin,
  eventType: alerts.eventType,
  severity: alerts.severity,
  originalSeverity: alerts.originalSeverity,
  status: alerts.status,
  title: alerts.title,
  description: alerts.description,
  instruction: alerts.instruction,
  issuedAt: alerts.issuedAt,
  effectiveAt: alerts.effectiveAt,
  expiresAt: alerts.expiresAt,
  isOfficial: alerts.isOfficial,
  isSimulated: alerts.isSimulated,
  sourceUrl: alerts.sourceUrl,
  fetchedAt: alerts.fetchedAt,
  createdAt: alerts.createdAt,
  updatedAt: alerts.updatedAt,
};

type AlertRow = {
  id: string;
  externalId: string;
  sourceCode: string;
  sourceType: string;
  origin: string;
  eventType: string;
  severity: number;
  originalSeverity: string;
  status: string;
  title: string;
  description: string;
  instruction: string | null;
  issuedAt: Date | null;
  effectiveAt: Date | null;
  expiresAt: Date | null;
  isOfficial: boolean;
  isSimulated: boolean;
  sourceUrl: string;
  fetchedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

function toDomain(row: AlertRow, areas: { areaDesc: string }[]): Alert {
  return {
    id: row.id,
    externalId: row.externalId,
    source: row.sourceCode,
    sourceType: row.sourceType,
    origin: row.origin as AlertOrigin,
    eventType: row.eventType,
    severity: row.severity as AlertSeverity,
    originalSeverity: row.originalSeverity,
    status: row.status as AlertStatus,
    title: row.title,
    description: row.description,
    instruction: row.instruction ?? undefined,
    issuedAt: row.issuedAt?.toISOString(),
    effectiveAt: row.effectiveAt?.toISOString(),
    expiresAt: row.expiresAt?.toISOString(),
    areas,
    isOfficial: row.isOfficial,
    isSimulated: row.isSimulated,
    sourceUrl: row.sourceUrl,
    fetchedAt: row.fetchedAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function loadAreasMap(ids: string[]): Promise<Map<string, { areaDesc: string }[]>> {
  const map = new Map<string, { areaDesc: string }[]>();
  if (ids.length === 0) return map;
  const db = getDb();
  const rows = await db
    .select({ alertId: alertAreas.alertId, name: alertAreas.name })
    .from(alertAreas)
    .where(sql`${alertAreas.alertId} IN ${ids}`)
    .orderBy(asc(alertAreas.createdAt));
  for (const row of rows) {
    const list = map.get(row.alertId) ?? [];
    list.push({ areaDesc: row.name });
    map.set(row.alertId, list);
  }
  return map;
}

export class PostgresAlertRepository {
  /** Upsert (dedupe: source code + externalId) with areas, atomically. */
  async upsertAlerts(
    sourceCode: string,
    incoming: Alert[]
  ): Promise<AlertUpsertResult> {
    const db = getDb();
    return db.transaction(async (tx) => {
      const source = await tx
        .select({ id: dataSources.id })
        .from(dataSources)
        .where(eq(dataSources.code, sourceCode))
        .limit(1);
      if (source.length === 0) {
        throw new Error(
          `DataSource "${sourceCode}" não registrada — rode npm run db:seed.`
        );
      }
      const sourceId = source[0].id;

      let inserted = 0;
      let updated = 0;

      for (const alert of incoming) {
        const row = {
          externalId: alert.externalId,
          sourceId,
          sourceType: alert.sourceType,
          origin: alert.origin,
          eventType: alert.eventType,
          severity: alert.severity,
          originalSeverity: alert.originalSeverity,
          status: alert.status,
          title: alert.title,
          description: alert.description,
          instruction: alert.instruction ?? null,
          issuedAt: alert.issuedAt ? new Date(alert.issuedAt) : null,
          effectiveAt: alert.effectiveAt ? new Date(alert.effectiveAt) : null,
          expiresAt: alert.expiresAt ? new Date(alert.expiresAt) : null,
          isOfficial: alert.isOfficial,
          isSimulated: alert.isSimulated,
          sourceUrl: alert.sourceUrl,
          fetchedAt: new Date(alert.fetchedAt),
          updatedAt: new Date(),
        };

        const result = await tx
          .insert(alerts)
          .values(row)
          .onConflictDoUpdate({
            target: [alerts.sourceId, alerts.externalId],
            set: {
              sourceType: row.sourceType,
              origin: row.origin,
              eventType: row.eventType,
              severity: row.severity,
              originalSeverity: row.originalSeverity,
              status: row.status,
              title: row.title,
              description: row.description,
              instruction: row.instruction,
              issuedAt: row.issuedAt,
              effectiveAt: row.effectiveAt,
              expiresAt: row.expiresAt,
              isOfficial: row.isOfficial,
              isSimulated: row.isSimulated,
              sourceUrl: row.sourceUrl,
              fetchedAt: row.fetchedAt,
              updatedAt: new Date(),
            },
          })
          .returning({
            id: alerts.id,
            // Postgres quirk: xmax = 0 on a freshly inserted row within a
            // statement; on conflict-update it carries the writer xid.
            wasInserted: sql<boolean>`(xmax = 0)`,
          });

        if (result[0].wasInserted) {
          inserted += 1;
        } else {
          updated += 1;
        }

        // Areas: this fetch is the source of truth — replace in-tx.
        const savedId = result[0].id;
        await tx.delete(alertAreas).where(eq(alertAreas.alertId, savedId));
        if (alert.areas.length > 0) {
          await tx
            .insert(alertAreas)
            .values(alert.areas.map((a) => ({ alertId: savedId, name: a.areaDesc })));
        }
      }

      return { inserted, updated };
    });
  }

  async list(
    filter: AlertFilter = {},
    pagination: PaginationQuery = { page: 1, pageSize: 20 }
  ): Promise<AlertListResult> {
    const db = getDb();
    const conditions = [];

    if (filter.source)
      conditions.push(sql`lower(${dataSources.code}) = lower(${filter.source})`);
    if (filter.severity !== undefined)
      conditions.push(eq(alerts.severity, filter.severity));
    if (filter.eventType) conditions.push(eq(alerts.eventType, filter.eventType));
    if (filter.status) conditions.push(eq(alerts.status, filter.status));
    if (filter.official !== undefined)
      conditions.push(eq(alerts.isOfficial, filter.official === 'true'));
    if (filter.active !== undefined) {
      const activeCond = and(
        eq(alerts.status, 'active'),
        or(isNull(alerts.expiresAt), gt(alerts.expiresAt, new Date()))
      );
      conditions.push(filter.active === 'true' ? activeCond : sql`NOT (${activeCond})`);
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const countRows = await db
      .select({ total: sql<number>`count(*)::int` })
      .from(alerts)
      .innerJoin(dataSources, eq(alerts.sourceId, dataSources.id))
      .where(where);
    const total = countRows[0]?.total ?? 0;

    const rows = await db
      .select(alertColumns)
      .from(alerts)
      .innerJoin(dataSources, eq(alerts.sourceId, dataSources.id))
      .where(where)
      .orderBy(desc(alerts.severity), desc(alerts.effectiveAt), asc(alerts.id))
      .limit(pagination.pageSize)
      .offset((pagination.page - 1) * pagination.pageSize);

    const areasMap = await loadAreasMap(rows.map((r) => r.id));

    return {
      items: rows.map((r) => toDomain(r, areasMap.get(r.id) ?? [])),
      meta: {
        page: pagination.page,
        pageSize: pagination.pageSize,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / pagination.pageSize),
      },
    };
  }

  /**
   * Resolves by UUID (persisted row) OR by external_id fallback — legacy
   * deep-links (notification mocks like /alertas/alert-001) keep working
   * against the external id of the active source.
   */
  async getById(id: string): Promise<Alert | null> {
    const db = getDb();
    const activeCode =
      (process.env.ALERT_DATA_MODE || 'mock') === 'official' ? 'INMET' : 'MOCK';

    try {
      const rows = await db
        .select(alertColumns)
        .from(alerts)
        .innerJoin(dataSources, eq(alerts.sourceId, dataSources.id))
        .where(eq(alerts.id, id))
        .limit(1);
      if (rows.length > 0) {
        const areasMap = await loadAreasMap([rows[0].id]);
        return toDomain(rows[0], areasMap.get(rows[0].id) ?? []);
      }
    } catch {
      // Non-UUID id → falls through to the external_id lookup below.
    }

    try {
      const rows = await db
        .select(alertColumns)
        .from(alerts)
        .innerJoin(dataSources, eq(alerts.sourceId, dataSources.id))
        .where(
          and(eq(alerts.externalId, id), eq(dataSources.code, activeCode))
        )
        .limit(1);
      if (rows.length === 0) return null;
      const areasMap = await loadAreasMap([rows[0].id]);
      return toDomain(rows[0], areasMap.get(rows[0].id) ?? []);
    } catch {
      return null;
    }
  }
}
