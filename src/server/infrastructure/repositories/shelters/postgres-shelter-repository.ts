/**
 * PostgreSQL shelter repository (RECOVERY-3).
 * Read path for /api/v1/shelters — seeded with simulated data
 * (is_simulated = true preserved from the seed).
 */

import { and, asc, eq, or, sql } from 'drizzle-orm';
import { getDb } from '@/server/infrastructure/db/client';
import { shelters } from '@/server/infrastructure/db/schema';
import type {
  Shelter,
  ShelterFilter,
} from '@/server/domain/shelters/shelter.contract';

export interface ShelterListResult {
  items: Shelter[];
  total: number;
}

export class PostgresShelterRepository {
  async list(filter: ShelterFilter = {}): Promise<Shelter[]> {
    const db = getDb();
    const conditions = [];
    if (filter.status) conditions.push(eq(shelters.status, filter.status));
    if (filter.city)
      conditions.push(
        sql`${shelters.address} ILIKE ${'%' + filter.city + '%'}`
      );
    if (filter.search)
      conditions.push(
        or(
          sql`${shelters.name} ILIKE ${'%' + filter.search + '%'}`,
          sql`${shelters.address} ILIKE ${'%' + filter.search + '%'}`
        )
      );
    if (filter.accessible !== undefined)
      conditions.push(eq(shelters.accessibility, filter.accessible === 'true'));
    if (filter.acceptsAnimals !== undefined)
      conditions.push(
        eq(shelters.acceptsAnimals, filter.acceptsAnimals === 'true')
      );

    const rows = await db
      .select()
      .from(shelters)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(asc(shelters.name));

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      address: r.address,
      latitude: undefined,
      longitude: undefined,
      capacity: r.capacity,
      estimatedVacancies: r.estimatedVacancies,
      status: r.status as Shelter['status'],
      accessibility: r.accessibility,
      acceptsAnimals: r.acceptsAnimals,
      foodAvailable: r.foodAvailable,
      medicalSupport: r.medicalSupport,
      phone: r.phone,
      lastUpdatedAt: r.lastUpdatedAt.toISOString(),
      source: r.source,
      isSimulated: true as const,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  }

  async getById(id: string): Promise<Shelter | null> {
    const all = await this.list();
    return all.find((s) => s.id === id) ?? null;
  }

  /** Deterministic seed insert keyed by (name, address). */
  async upsertSeed(
    shelter: Omit<Shelter, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<void> {
    const db = getDb();
    const existing = await db
      .select({ id: shelters.id })
      .from(shelters)
      .where(
        and(
          eq(shelters.name, shelter.name),
          eq(shelters.address, shelter.address)
        )
      )
      .limit(1);
    if (existing.length > 0) return;
    await db.insert(shelters).values({
      name: shelter.name,
      address: shelter.address,
      capacity: shelter.capacity,
      estimatedVacancies: shelter.estimatedVacancies,
      status: shelter.status,
      accessibility: shelter.accessibility,
      acceptsAnimals: shelter.acceptsAnimals,
      foodAvailable: shelter.foodAvailable,
      medicalSupport: shelter.medicalSupport,
      phone: shelter.phone,
      source: shelter.source,
      isSimulated: shelter.isSimulated,
      lastUpdatedAt: new Date(shelter.lastUpdatedAt),
    });
  }

  async count(): Promise<number> {
    const db = getDb();
    const rows = await db
      .select({ total: sql<number>`count(*)::int` })
      .from(shelters);
    return rows[0]?.total ?? 0;
  }

  async existsAny(): Promise<boolean> {
    return (await this.count()) > 0;
  }

  /** Test helper. */
  async clear(): Promise<void> {
    const db = getDb();
    await db.delete(shelters);
  }
}

