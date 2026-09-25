/**
 * PostgreSQL incident repository (RECOVERY-3).
 *
 * REAL persistence now. Honesty mapping:
 * - isSimulated = false (the record genuinely exists in the database).
 * - The "not sent to Civil Defense" disclaimer stays in the UI/API meta.
 * - Only domain fields are stored: no IP, no User-Agent, no GPS
 *   (location coordinates are a future, consented feature).
 */

import { desc, eq, and } from 'drizzle-orm';
import { getDb } from '@/server/infrastructure/db/client';
import { incidents } from '@/server/infrastructure/db/schema';
import type {
  CreateIncidentInput,
  Incident,
  IncidentFilter,
} from '@/server/domain/incidents/incident.contract';

export interface IncidentRepositoryPort {
  create(input: CreateIncidentInput): Promise<Incident>;
  list(filter?: IncidentFilter): Promise<Incident[]>;
  getById(id: string): Promise<Incident | null>;
  clear(): void;
}

function toDomain(row: typeof incidents.$inferSelect): Incident {
  return {
    id: row.id,
    type: row.type as Incident['type'],
    description: row.description,
    location: row.locationText,
    waterDepth: row.waterDepth,
    roadBlocked: row.roadBlocked,
    peopleAtRisk: row.peopleAtRisk,
    anonymous: row.anonymous,
    consent: row.consent,
    reportedAt: row.reportedAt.toISOString(),
    status: row.status as Incident['status'],
    source: row.source,
    isSimulated: row.isSimulated,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export class PostgresIncidentRepository {
  async create(input: CreateIncidentInput): Promise<Incident> {
    const db = getDb();
    const now = new Date();
    const result = await db
      .insert(incidents)
      .values({
        type: input.type,
        description: input.description,
        locationText: input.location,
        waterDepth: input.waterDepth ?? null,
        roadBlocked: input.roadBlocked,
        peopleAtRisk: input.peopleAtRisk,
        anonymous: input.anonymous,
        consent: input.consent,
        status: 'pending',
        source: 'COMMUNITY_WEB',
        isSimulated: false,
        reportedAt: now,
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    return toDomain(result[0]);
  }

  async list(filter: IncidentFilter = {}): Promise<Incident[]> {
    const db = getDb();
    const conditions = [];
    if (filter.status) conditions.push(eq(incidents.status, filter.status));
    if (filter.type) conditions.push(eq(incidents.type, filter.type));
    const rows = await db
      .select()
      .from(incidents)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(incidents.reportedAt));
    return rows.map(toDomain);
  }

  async getById(id: string): Promise<Incident | null> {
    const db = getDb();
    try {
      const rows = await db
        .select()
        .from(incidents)
        .where(eq(incidents.id, id))
        .limit(1);
      return rows.length > 0 ? toDomain(rows[0]) : null;
    } catch {
      return null;
    }
  }

  /** Test helper — integration suites run against the dedicated test DB. */
  async clear(): Promise<void> {
    await getDb().delete(incidents);
  }
}
