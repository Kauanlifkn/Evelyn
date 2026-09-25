/**
 * PostgreSQL sensor & observation repositories (RECOVERY-3).
 *
 * FOUNDATION ONLY (doc §56): storage exists for RECOVERY-5. No ingestion
 * endpoint, no device API, no Arduino — just deterministic seed (RIO-001
 * stays UNPROVISIONED) and persistence for future observations.
 */

import { desc, eq } from 'drizzle-orm';
import { getDb } from '@/server/infrastructure/db/client';
import { observations, sensors } from '@/server/infrastructure/db/schema';
import type {
  Observation,
  Sensor,
} from '@/server/domain/sensors/sensor.contract';

export class PostgresSensorRepository {
  /** Seed/provision helper keyed by external_id. */
  async upsertSensor(input: {
    externalId: string;
    name: string;
    type: string;
    status: string;
  }): Promise<void> {
    const db = getDb();
    await db
      .insert(sensors)
      .values({
        externalId: input.externalId,
        name: input.name,
        type: input.type,
        status: input.status,
      })
      .onConflictDoUpdate({
        target: sensors.externalId,
        set: { name: input.name, type: input.type, updatedAt: new Date() },
      });
  }

  async getByExternalId(externalId: string): Promise<Sensor | null> {
    const db = getDb();
    const rows = await db
      .select()
      .from(sensors)
      .where(eq(sensors.externalId, externalId))
      .limit(1);
    const r = rows[0];
    if (!r) return null;
    return {
      id: r.id,
      externalId: r.externalId,
      name: r.name,
      type: r.type as Sensor['type'],
      status: r.status as Sensor['status'],
      lastSeenAt: r.lastSeenAt?.toISOString(),
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    };
  }
}

export class PostgresObservationRepository {
  async insert(observation: Omit<Observation, 'id'>): Promise<void> {
    const db = getDb();
    await db.insert(observations).values({
      sensorId: observation.sensorId,
      value: observation.value,
      unit: observation.unit,
      rawValue: observation.rawValue ?? null,
      observedAt: new Date(observation.observedAt),
      receivedAt: new Date(observation.receivedAt),
      quality: observation.quality,
      metadata: observation.metadata,
    });
  }

  async listBySensor(sensorId: string, limit = 100): Promise<Observation[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(observations)
      .where(eq(observations.sensorId, sensorId))
      .orderBy(desc(observations.observedAt))
      .limit(limit);
    return rows.map((r) => ({
      id: r.id,
      sensorId: r.sensorId,
      value: r.value,
      unit: r.unit,
      rawValue: r.rawValue ?? undefined,
      observedAt: r.observedAt.toISOString(),
      receivedAt: r.receivedAt.toISOString(),
      quality: r.quality as Observation['quality'],
      metadata: r.metadata as Record<string, string | number | boolean>,
    }));
  }
}
