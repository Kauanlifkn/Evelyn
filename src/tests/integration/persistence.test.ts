import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

/**
 * RECOVERY-3 integration tests — REAL PostgreSQL/PostGIS + Redis.
 *
 * Isolation (docs/DATABASE.md §Testes):
 * - Runs against hidro_alerta_test (dedicated DB), NEVER the dev database.
 * - Gated behind RUN_DB_TESTS=1 so `npm test` stays green without Docker:
 *     npm run infra:up && npm run db:test && npm run test:db
 * - The automated suite NEVER touches the real INMET feed (doc §19): the
 *   sync core receives a deterministic fake source.
 */

function loadEnv(): void {
  if (process.env.DATABASE_URL) return;
  try {
    for (const line of readFileSync('.env', 'utf8').split('\n')) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)\s*$/);
      if (match) process.env[match[1]] ??= match[2];
    }
  } catch {
    // sem .env
  }
}

loadEnv();
const runDb = process.env.RUN_DB_TESTS === '1';
const testUrl = process.env.TEST_DATABASE_URL;

if (!runDb || !testUrl) {
  describe('integration persistence (skipped)', () => {
    it('requires RUN_DB_TESTS=1 + TEST_DATABASE_URL (npm run db:test && npm run test:db)', () => {
      expect(true).toBe(true);
    });
  });
} else {
  // Repositories resolve DATABASE_URL at call time → point at TEST db.
  process.env.DATABASE_URL = testUrl;
  process.env.PERSISTENCE_DRIVER = 'postgres';


  describe('RECOVERY-3 — persistência real (Postgres/PostGIS/Redis)', () => {
    let pool: import('pg').Pool;
    let alertRepo: import('@/server/infrastructure/repositories/alerts/postgres-alert-repository').PostgresAlertRepository;
    let shelterRepo: import('@/server/infrastructure/repositories/shelters/postgres-shelter-repository').PostgresShelterRepository;
    let incidentRepo: import('@/server/infrastructure/repositories/incidents/postgres-incident-repository').PostgresIncidentRepository;
    let performSync: typeof import('@/server/infrastructure/sync/inmet-sync').performSync;
    let fakeAlert: (partial: Partial<import('@/server/domain/alerts/alert.contract').Alert>) => import('@/server/domain/alerts/alert.contract').Alert;

    beforeAll(async () => {
      // Zero-to-ready: migrate + seed the dedicated test database.
      execFileSync('npx', ['tsx', 'scripts/db-setup.mts', 'hidro_alerta_test'], {
        stdio: 'pipe',
        env: { ...process.env, DATABASE_URL: testUrl! },
      });

      const client = await import('@/server/infrastructure/db/client');
      pool = client.getPool();
      const { PostgresAlertRepository: R } = await import(
        '@/server/infrastructure/repositories/alerts/postgres-alert-repository'
      );
      const { PostgresShelterRepository: S } = await import(
        '@/server/infrastructure/repositories/shelters/postgres-shelter-repository'
      );
      const { PostgresIncidentRepository: I } = await import(
        '@/server/infrastructure/repositories/incidents/postgres-incident-repository'
      );
      const sync = await import('@/server/infrastructure/sync/inmet-sync');
      alertRepo = new R();
      shelterRepo = new S();
      incidentRepo = new I();
      performSync = sync.performSync;

      fakeAlert = (partial) => ({
        id: 'fake-1',
        externalId: '9001',
        source: 'INMET',
        sourceType: 'OFFICIAL_WEATHER',
        origin: 'OFFICIAL',
        eventType: 'heavy_rain',
        severity: 2,
        originalSeverity: 'Perigo',
        status: 'active',
        title: 'Aviso de teste',
        description: 'd',
        areas: [{ areaDesc: 'Área A' }, { areaDesc: 'Área B' }],
        isOfficial: true,
        isSimulated: false,
        sourceUrl: '',
        fetchedAt: '2026-09-25T00:00:00Z',
        createdAt: '2026-09-25T00:00:00Z',
        updatedAt: '2026-09-25T00:00:00Z',
        ...partial,
      });
    }, 120_000);

    afterAll(async () => {
      const { closePool } = await import('@/server/infrastructure/db/client');
      const { closeRedis } = await import('@/server/infrastructure/redis/client');
      await closeRedis();
      await closePool();
    }, 30_000);

    it('database + postgis + redis healthy', async () => {
      const client = await import('@/server/infrastructure/db/client');
      expect(await client.pingDatabase()).toBe(true);
      expect(await client.postgisVersion()).toMatch(/^3\./);
      const { pingRedis } = await import('@/server/infrastructure/redis/client');
      expect(await pingRedis()).toBe(true);
    });

    it('seed from zero: INMET+MOCK sources, shelters, sensor RIO-001 unprovisioned', async () => {
      const r = await pool.query(
        `SELECT code, type FROM data_sources ORDER BY code`
      );
      expect(r.rows.map((x) => x.code)).toEqual(['INMET', 'MOCK']);

      const shelters = await shelterRepo.list();
      expect(shelters).toHaveLength(8);
      shelters.forEach((s) => expect(s.isSimulated).toBe(true));

      const sensor = await pool.query(
        `SELECT status FROM sensors WHERE external_id = 'RIO-001'`
      );
      expect(sensor.rows[0].status).toBe('unprovisioned');
    });

    it('mock alerts seeded as SIMULATED, never official', async () => {
      const r = await pool.query(
        `SELECT count(*)::int AS n FROM alerts WHERE is_simulated = true AND is_official = false`
      );
      expect(r.rows[0].n).toBeGreaterThanOrEqual(12);
      const violation = await pool.query(
        `SELECT count(*)::int AS n FROM alerts WHERE is_simulated = true AND is_official = true`
      );
      expect(violation.rows[0].n).toBe(0);
    });

    it('severity CHECK constraint blocks level 5', async () => {
      await expect(
        pool.query(
          `INSERT INTO alerts (external_id, source_id, source_type, origin, event_type,
             severity, original_severity, status, title, is_official, is_simulated,
             source_url, fetched_at)
           SELECT 'x-bad', id, 'OFFICIAL_WEATHER', 'OFFICIAL', 'heavy_rain',
             5, 'x', 'active', 't', true, false, '', now()
           FROM data_sources WHERE code = 'INMET'`
        )
      ).rejects.toThrow(/alerts_severity_range|check/i);
    });

    it('is_official + is_simulated are mutually exclusive (DB CHECK)', async () => {
      await expect(
        pool.query(
          `INSERT INTO alerts (external_id, source_id, source_type, origin, event_type,
             severity, original_severity, status, title, is_official, is_simulated,
             source_url, fetched_at)
           SELECT 'x-both', id, 'OFFICIAL_WEATHER', 'OFFICIAL', 'heavy_rain',
             1, 'x', 'active', 't', true, true, '', now()
           FROM data_sources WHERE code = 'INMET'`
        )
      ).rejects.toThrow(/alerts_official_not_simulated|check/i);
    });

    it('upsert dedupe (source + external_id): first inserts, second updates, areas replaced in transaction', async () => {
      // Self-contained: remove leftovers from previous suite runs.
      await pool.query(`DELETE FROM alerts WHERE external_id = '9001'`);
      const first = await alertRepo.upsertAlerts('INMET', [
        fakeAlert({ externalId: '9001' }),
      ]);
      expect(first).toEqual({ inserted: 1, updated: 0 });

      // Same external id, new title AND a different area list → update
      // with full area replacement, never a duplicate row.
      const second = await alertRepo.upsertAlerts('INMET', [
        fakeAlert({ externalId: '9001', title: 'Aviso atualizado', areas: [{ areaDesc: 'Só uma área' }] }),
      ]);
      expect(second).toEqual({ inserted: 0, updated: 1 });

      const rows = await pool.query(
        `SELECT a.title, count(aa.id)::int AS areas
         FROM alerts a LEFT JOIN alert_areas aa ON aa.alert_id = a.id
         WHERE a.external_id = '9001'
         GROUP BY a.title`
      );
      expect(rows.rowCount).toBe(1);
      expect(rows.rows[0].title).toBe('Aviso atualizado');
      expect(rows.rows[0].areas).toBe(1);
    });

    it('list filters (severity/active/official) and pagination', async () => {
      const page = await alertRepo.list(
        { source: 'INMET', active: 'true', official: 'true' },
        { page: 1, pageSize: 10 }
      );
      expect(page.items.length).toBeGreaterThan(0);
      page.items.forEach((a) => {
        expect(a.source).toBe('INMET');
        expect(a.isOfficial).toBe(true);
        expect(a.status).toBe('active');
      });
      const capped = await alertRepo.list({}, { page: 1, pageSize: 2 });
      expect(capped.items.length).toBeLessThanOrEqual(2);
      expect(capped.meta.totalPages).toBeGreaterThanOrEqual(2);
    });

    it('incidents persist for real: isSimulated=false, list newest first', async () => {
      const created = await incidentRepo.create({
        type: 'waterlogging',
        description: 'Alagamento real persistido no banco de teste.',
        location: 'Av. Teste, 100',
        roadBlocked: true,
        peopleAtRisk: 2,
        anonymous: false,
        consent: true,
      });
      expect(created.id).toMatch(/^[0-9a-f-]{36}$/);
      expect(created.isSimulated).toBe(false);
      expect(created.status).toBe('pending');

      const listed = await incidentRepo.list();
      expect(listed[0].id).toBe(created.id);
      const found = await incidentRepo.getById(created.id);
      expect(found?.consent).toBe(true);
      await incidentRepo.clear();
      expect(await incidentRepo.list()).toHaveLength(0);
    });

    it('PostGIS foundation: Point/MultiPolygon, ST_Contains, ST_DWithin', async () => {
      // Territory with a real MultiPolygon.
      await pool.query(`
        INSERT INTO territories (name, type, ibge_code, geometry)
        VALUES ('Território Geom', 'municipality', '9999999',
                ST_GeomFromText('MULTIPOLYGON(((-46.7 -23.5, -46.6 -23.5, -46.6 -23.6, -46.7 -23.6, -46.7 -23.5)))', 4326))
        ON CONFLICT DO NOTHING`);
      const contains = await pool.query(`
        SELECT ST_Contains(t.geometry,
               ST_SetSRID(ST_MakePoint(-46.65, -23.55), 4326)) AS inside
        FROM territories t WHERE t.ibge_code = '9999999'`);
      expect(contains.rows[0].inside).toBe(true);
      const outside = await pool.query(`
        SELECT ST_Contains(t.geometry,
               ST_SetSRID(ST_MakePoint(0, 0), 4326)) AS inside
        FROM territories t WHERE t.ibge_code = '9999999'`);
      expect(outside.rows[0].inside).toBe(false);

      // Shelter with a Point location + ST_DWithin (25 km radius).
      await pool.query(`
        INSERT INTO shelters (name, address, location, capacity, estimated_vacancies,
            status, accessibility, accepts_animals, food_available, medical_support,
            phone, source, is_simulated, last_updated_at)
        VALUES ('Abrigo Geo', 'Rua Geoespacial, 1',
                ST_GeogFromText('SRID=4326;POINT(-46.65 -23.55)'),
                100, 100, 'open', true, false, true, false, null, 'TEST', true, now())
        ON CONFLICT DO NOTHING`);
      const near = await pool.query(`
        SELECT count(*)::int AS n FROM shelters
        WHERE ST_DWithin(location, ST_GeogFromText('SRID=4326;POINT(-46.63 -23.56)'), 25000)`);
      expect(near.rows[0].n).toBeGreaterThanOrEqual(1);

      // Self-contained: remove the geo fixtures for future runs.
      await pool.query(`DELETE FROM shelters WHERE name = 'Abrigo Geo'`);
      await pool.query(`DELETE FROM territories WHERE ibge_code = '9999999'`);
    });

    it('sync idempotency: same fetch twice → inserted then updated, row count stable', async () => {
      // Self-contained + deterministic fake source (never hits INMET).
      await pool.query(`DELETE FROM alerts WHERE external_id IN ('9101','9102')`);
      const batch = [
        fakeAlert({ externalId: '9101', title: 'Sync A' }),
        fakeAlert({ externalId: '9102', title: 'Sync B', severity: 3 }),
      ];
      const source = { id: 'INMET', fetchAlerts: async () => batch };

      const first = await performSync(source);
      expect(first.ran).toBe(true);
      expect(first.inserted).toBe(2);
      expect(first.updated).toBe(0);

      const second = await performSync(source);
      expect(second.ran).toBe(true);
      expect(second.inserted).toBe(0);
      expect(second.updated).toBe(2);

      const total = await pool.query(
        `SELECT count(*)::int AS n FROM alerts WHERE external_id IN ('9101','9102')`
      );
      expect(total.rows[0].n).toBe(2);
    }, 30_000);

    it('Redis-backed rate limiter: 5/min → 6th gets RATE_LIMITED with retry hint', async () => {
      const { RedisRateLimiter } = await import(
        '@/server/infrastructure/http/redis-rate-limiter'
      );
      const limiter = new RedisRateLimiter({ limit: 5, windowMs: 60_000, prefix: `test:${Date.now()}` });
      const key = `k:${Date.now()}`;
      for (let i = 0; i < 5; i++) {
        await limiter.enforce(key);
      }
      await expect(limiter.enforce(key)).rejects.toMatchObject({
        code: 'RATE_LIMITED',
        details: { retryAfterSeconds: expect.any(Number) },
      });
    }, 30_000);
  });

}
