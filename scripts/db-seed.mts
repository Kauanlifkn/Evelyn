/**
 * Deterministic seed (RECOVERY-3).
 *
 * Creates/updates (idempotent):
 * - data_sources: INMET (official) + MOCK (demo)
 * - source_health: MOCK=ONLINE (demo), INMET=OFFLINE até o primeiro sync
 * - territories: conjunto básico de teste (sem geometria inventada)
 * - shelters: dataset simulado (is_simulated = true)
 * - sensors: RIO-001 como UNPROVISIONED (nenhuma conexão fingida)
 * - mock alerts: upsert com is_official=false / is_simulated=true
 *
 * NUNCA cria alertas oficiais fake (doc §1/§2).
 */

import { readFileSync } from 'node:fs';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { Pool } from 'pg';
import {
  dataSources,
  sensors,
  sourceHealth,
  territories,
} from '../src/server/infrastructure/db/schema';
import { PostgresAlertRepository } from '../src/server/infrastructure/repositories/alerts/postgres-alert-repository';
import { MockAlertSource } from '../src/server/infrastructure/providers/alerts/mock-alert-adapter';
import { PostgresShelterRepository } from '../src/server/infrastructure/repositories/shelters/postgres-shelter-repository';
import { mockAlerts } from '../src/data/mocks/alerts';
import { mockShelters } from '../src/data/mocks/shelters';

if (!process.env.DATABASE_URL) {
  try {
    for (const line of readFileSync('.env', 'utf8').split('\n')) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)\s*$/);
      if (match) process.env[match[1]] ??= match[2];
    }
  } catch {
    // sem .env
  }
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL ausente.');
  process.exit(1);
}

const pool = new Pool({ connectionString: url, max: 2 });
const db = drizzle(pool);

try {
  // ── Data sources ─────────────────────────────────────────────────────
  await db
    .insert(dataSources)
    .values({
      code: 'INMET',
      name: 'Instituto Nacional de Meteorologia (INMET)',
      type: 'OFFICIAL_WEATHER',
      baseUrl: 'https://apiprevmet3.inmet.gov.br/avisos/rss',
    })
    .onConflictDoUpdate({
      target: dataSources.code,
      set: { updatedAt: new Date() },
    });
  await db
    .insert(dataSources)
    .values({
      code: 'MOCK',
      name: 'Ambiente de demonstração (dados simulados)',
      type: 'DEMO',
    })
    .onConflictDoUpdate({
      target: dataSources.code,
      set: { updatedAt: new Date() },
    });

  // ── Source health (MOCK sempre ONLINE; INMET aguarda primeiro sync) ──
  const mockId = await getIdByCode('MOCK');
  await upsertHealth(mockId, 'ONLINE', 'Fonte de demonstração ativa');
  const inmetId = await getIdByCode('INMET');
  if (!(await healthExists(inmetId))) {
    await upsertHealth(inmetId, 'OFFLINE', 'Aguardando primeiro sync');
  }

  // ── Territories (básicos de teste, sem geometria inventada) ──────────
  const territoriesSeed = [
    { name: 'São Paulo', ibgeCode: '3550308' },
    { name: 'Rio de Janeiro', ibgeCode: '3304557' },
    { name: 'Recife', ibgeCode: '2611606' },
    { name: 'Porto Alegre', ibgeCode: '4314902' },
  ];
  for (const territory of territoriesSeed) {
    const existing = await db
      .select({ id: territories.id })
      .from(territories)
      .where(eq(territories.ibgeCode, territory.ibgeCode))
      .limit(1);
    if (existing.length === 0) {
      await db.insert(territories).values(territory);
    }
  }

  // ── Shelters (simulados) ─────────────────────────────────────────────
  const shelterRepo = new PostgresShelterRepository();
  for (const legacy of mockShelters) {
    await shelterRepo.upsertSeed({
      name: legacy.name,
      address: legacy.address,
      capacity: legacy.capacity,
      estimatedVacancies: legacy.availableSpots,
      status: legacy.status,
      accessibility: legacy.accessible,
      acceptsAnimals: legacy.acceptsAnimals,
      foodAvailable: legacy.hasFood,
      medicalSupport: legacy.hasMedical,
      phone: legacy.contact.length > 0 ? legacy.contact : null,
      lastUpdatedAt: legacy.lastUpdate,
      source: 'MOCK',
      isSimulated: true,
    });
  }

  // ── Sensor RIO-001 (UNPROVISIONED — nada de conexão fingida) ─────────
  await db
    .insert(sensors)
    .values({
      externalId: 'RIO-001',
      name: 'Sensor de nível do rio RIO-001',
      type: 'river_level',
      status: 'unprovisioned',
    })
    .onConflictDoUpdate({
      target: sensors.externalId,
      set: { updatedAt: new Date() },
    });

  // ── Mock alerts (upsert; NUNCA oficiais) ─────────────────────────────
  const source = new MockAlertSource();
  const domainAlerts = await source.fetchAlerts();
  const alertRepo = new PostgresAlertRepository();
  const { inserted, updated } = await alertRepo.upsertAlerts('MOCK', domainAlerts);

  console.log(
    `✔ seed concluída: shelters=${mockShelters.length}, alertas mock inseridos=${inserted}, atualizados=${updated}`
  );
  await pool.end();

  // ── helpers ──────────────────────────────────────────────────────────
  async function getIdByCode(code: string): Promise<string> {
    const rows = await db
      .select({ id: dataSources.id })
      .from(dataSources)
      .where(eq(dataSources.code, code))
      .limit(1);
    return rows[0].id;
  }

  async function healthExists(sourceId: string): Promise<boolean> {
    const rows = await db
      .select({ id: sourceHealth.id })
      .from(sourceHealth)
      .where(eq(sourceHealth.sourceId, sourceId))
      .limit(1);
    return rows.length > 0;
  }

  async function upsertHealth(sourceId: string, status: string, message: string): Promise<void> {
    const now = new Date();
    await db
      .insert(sourceHealth)
      .values({
        sourceId,
        status,
        lastAttemptAt: now,
        lastSuccessAt: status === 'ONLINE' ? now : null,
        message,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: sourceHealth.sourceId,
        set: { status, message, updatedAt: now },
      });
  }
} catch (error) {
  console.error('✖ falha no seed:', error instanceof Error ? error.message : error);
  const cause = (error as { cause?: { message?: string; detail?: string } }).cause;
  if (cause) console.error('↳ causa:', cause.message, cause.detail ?? '');
  await pool.end();
  process.exit(1);
}

// keeps imports honest (mockAlerts count used for log)
void mockAlerts;
