/**
 * Composition root (RECOVERY-2).
 * The single place that knows concrete implementations. When RECOVERY-3
 * adds PostgreSQL/Redis, only this file changes — services keep their
 * ports.
 */

import { getInmetProvider } from '@/server/providers/alerts/inmet-provider';
import { getMockProvider } from '@/server/providers/alerts/mock-provider';
import type { AlertSourcePort } from '@/server/domain/alerts/alert.contract';
import { InmetAlertSource } from './providers/alerts/inmet-alert-adapter';
import { MockAlertSource } from './providers/alerts/mock-alert-adapter';
import { InMemoryShelterRepository } from './repositories/shelter/in-memory-shelter-repository';
import { InMemoryIncidentRepository } from './repositories/incident/in-memory-incident-repository';
import { RateLimiter } from './http/rate-limit';
import { AlertService } from '@/server/application/alerts/alert-service';
import { ShelterService } from '@/server/application/shelters/shelter-service';
import { IncidentService } from '@/server/application/incidents/incident-service';
import { SourceService } from '@/server/application/sources/source-service';
import { HealthService } from '@/server/application/health/health-service';

export function getDataMode(): string {
  return process.env.ALERT_DATA_MODE || 'mock';
}

export function getAlertSource(): AlertSourcePort {
  if (getDataMode() === 'official') {
    // Reuses the RECOVERY-1 provider singleton (timeout/retry/cache/health).
    return new InmetAlertSource(getInmetProvider());
  }
  return new MockAlertSource();
}

// Process-wide singletons (in-memory state must survive across requests).
const globalStore = globalThis as unknown as {
  __hidroAlertaServices?: Services;
  __hidroAlertaIncidentsRepo?: InMemoryIncidentRepository;
  __hidroAlertaIncidentsLimiter?: RateLimiter;
};

export interface Services {
  alertService: AlertService;
  shelterService: ShelterService;
  incidentService: IncidentService;
  sourceService: SourceService;
  healthService: HealthService;
  incidentRateLimiter: RateLimiter;
}

export function getServices(): Services {
  if (!globalStore.__hidroAlertaServices) {
    const shelterRepository = new InMemoryShelterRepository();
    if (!globalStore.__hidroAlertaIncidentsRepo) {
      globalStore.__hidroAlertaIncidentsRepo = new InMemoryIncidentRepository();
    }
    if (!globalStore.__hidroAlertaIncidentsLimiter) {
      // Transitional in-memory limiter (Redis in RECOVERY-3).
      globalStore.__hidroAlertaIncidentsLimiter = new RateLimiter({
        limit: 5,
        windowMs: 60_000,
      });
    }
    globalStore.__hidroAlertaServices = {
      alertService: new AlertService(getAlertSource()),
      shelterService: new ShelterService(shelterRepository),
      incidentService: new IncidentService(
        globalStore.__hidroAlertaIncidentsRepo
      ),
      // SourceService reads the health read-model of the ACTIVE provider
      // (INMET in official mode, demo source in mock mode).
      sourceService: new SourceService(
        getDataMode() === 'official'
          ? getInmetProvider()
          : getMockProvider()
      ),
      healthService: new HealthService(),
      incidentRateLimiter: globalStore.__hidroAlertaIncidentsLimiter,
    };
  }
  return globalStore.__hidroAlertaServices;
}

/** Test helper — drops all singletons (used only by unit tests). */
export function resetServicesForTesting(): void {
  delete globalStore.__hidroAlertaServices;
  delete globalStore.__hidroAlertaIncidentsRepo;
  delete globalStore.__hidroAlertaIncidentsLimiter;
}
