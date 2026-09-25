/**
 * Composition root (RECOVERY-3).
 * The single place that knows concrete implementations.
 *
 * PERSISTENCE_DRIVER:
 * - "postgres" → real repositories (requires docker compose up -d + migrate)
 * - "memory"   → in-memory repositories (unit tests / offline fallback)
 * Default: postgres when DATABASE_URL is present, memory otherwise.
 *
 * ALERT_DATA_MODE:
 * - "official" → INMET synced to the DB (syncInmetAlerts) and read from it
 * - "mock"     → deterministic simulated dataset (seeded, never official)
 */

import { getInmetProvider } from '@/server/providers/alerts/inmet-provider';
import { getMockProvider } from '@/server/providers/alerts/mock-provider';
import type { AlertSourcePort } from '@/server/domain/alerts/alert.contract';
import { InmetAlertSource } from './providers/alerts/inmet-alert-adapter';
import { MockAlertSource } from './providers/alerts/mock-alert-adapter';
import { PostgresAlertRepository } from './repositories/alerts/postgres-alert-repository';
import { InMemoryShelterRepository } from './repositories/shelter/in-memory-shelter-repository';
import { PostgresShelterRepository } from './repositories/shelters/postgres-shelter-repository';
import { InMemoryIncidentRepository } from './repositories/incident/in-memory-incident-repository';
import { PostgresIncidentRepository } from './repositories/incidents/postgres-incident-repository';
import { PostgresSourceRepository } from './repositories/sources/postgres-source-repository';
import {
  DatabaseSourceSnapshotPort,
  ProviderSourceSnapshotPort,
} from './sources/source-snapshot';
import { RedisRateLimiter } from './http/redis-rate-limiter';
import { AlertService } from '@/server/application/alerts/alert-service';
import { ShelterService } from '@/server/application/shelters/shelter-service';
import { IncidentService } from '@/server/application/incidents/incident-service';
import { SourceService } from '@/server/application/sources/source-service';
import { HealthService } from '@/server/application/health/health-service';
import { persistenceDriver } from './db/client';

export function getDataMode(): string {
  return process.env.ALERT_DATA_MODE || 'mock';
}

export { persistenceDriver };

/** Legacy provider of the ACTIVE data mode (memory mode / warm-up). */
export function getActiveLegacyProvider() {
  return getDataMode() === 'official'
    ? getInmetProvider()
    : getMockProvider();
}

/** DB-backed read source: alerts live in Postgres (synced or seeded). */
class PostgresAlertSource implements AlertSourcePort {
  readonly id: string;
  private readonly repository = new PostgresAlertRepository();

  constructor(mode: string) {
    this.id = mode === 'official' ? 'INMET' : 'MOCK';
  }

  async fetchAlerts() {
    const page = await this.repository.list({}, { page: 1, pageSize: 1000 });
    return page.items;
  }
}

export interface Services {
  driver: 'postgres' | 'memory';
  dataMode: string;
  alertService: AlertService;
  shelterService: ShelterService;
  incidentService: IncidentService;
  sourceService: SourceService;
  healthService: HealthService;
  incidentRateLimiter: RedisRateLimiter;
}

const globalStore = globalThis as unknown as {
  __hidroAlertaServices?: Services;
  __hidroAlertaIncidentsRepo?: InMemoryIncidentRepository;
};

export function getServices(): Services {
  if (!globalStore.__hidroAlertaServices) {
    const driver = persistenceDriver();
    const dataMode = getDataMode();

    let alertService: AlertService;
    let shelterService: ShelterService;
    let incidentService: IncidentService;
    let sourceSnapshotPort;

    if (driver === 'postgres') {
      alertService = new AlertService(new PostgresAlertSource(dataMode));
      shelterService = new ShelterService(new PostgresShelterRepository());
      incidentService = new IncidentService(new PostgresIncidentRepository());
      sourceSnapshotPort = new DatabaseSourceSnapshotPort(
        new PostgresSourceRepository(),
        new ProviderSourceSnapshotPort(getActiveLegacyProvider())
      );
    } else {
      alertService = new AlertService(
        dataMode === 'official' ? new InmetAlertSource(getInmetProvider()) : new MockAlertSource()
      );
      shelterService = new ShelterService(new InMemoryShelterRepository());
      if (!globalStore.__hidroAlertaIncidentsRepo) {
        globalStore.__hidroAlertaIncidentsRepo = new InMemoryIncidentRepository();
      }
      incidentService = new IncidentService(globalStore.__hidroAlertaIncidentsRepo);
      sourceSnapshotPort = new ProviderSourceSnapshotPort(getActiveLegacyProvider());
    }

    globalStore.__hidroAlertaServices = {
      driver,
      dataMode,
      alertService,
      shelterService,
      incidentService,
      sourceService: new SourceService(sourceSnapshotPort),
      healthService: new HealthService(),
      // Redis-backed with documented in-memory fallback.
      incidentRateLimiter: new RedisRateLimiter({
        limit: 5,
        windowMs: 60_000,
      }),
    };
  }
  return globalStore.__hidroAlertaServices;
}

/** Test helper — drops all singletons (used only by unit tests). */
export function resetServicesForTesting(): void {
  delete globalStore.__hidroAlertaServices;
  delete globalStore.__hidroAlertaIncidentsRepo;
}
