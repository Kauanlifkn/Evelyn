import { describe, it, expect, beforeEach } from 'vitest';
import { AlertService, isActiveAlert } from '@/server/application/alerts/alert-service';
import { ShelterService } from '@/server/application/shelters/shelter-service';
import { IncidentService } from '@/server/application/incidents/incident-service';
import { SourceService } from '@/server/application/sources/source-service';
import { HealthService } from '@/server/application/health/health-service';
import { InMemoryShelterRepository } from '@/server/infrastructure/repositories/shelter/in-memory-shelter-repository';
import { InMemoryIncidentRepository } from '@/server/infrastructure/repositories/incident/in-memory-incident-repository';
import { InmetAlertSource, toDomainAlert } from '@/server/infrastructure/providers/alerts/inmet-alert-adapter';
import { MockAlertSource } from '@/server/infrastructure/providers/alerts/mock-alert-adapter';
import { legacySeverity, legacyStatus } from '@/server/infrastructure/providers/alerts/legacy-mapping';
import type { Alert, AlertSourcePort } from '@/server/domain/alerts/alert.contract';
import type { OfficialAlert } from '@/server/providers/alerts/types';
import { mockShelters } from '@/data/mocks/shelters';

function fakeAlert(partial: Partial<Alert>): Alert {
  return {
    id: 'a-1',
    externalId: '1',
    source: 'INMET',
    sourceType: 'OFFICIAL_WEATHER',
    origin: 'OFFICIAL',
    eventType: 'heavy_rain',
    severity: 2,
    originalSeverity: 'Perigo',
    status: 'active',
    title: 'Aviso',
    description: 'd',
    areas: [],
    isOfficial: true,
    isSimulated: false,
    sourceUrl: '',
    fetchedAt: '2026-09-25T00:00:00Z',
    createdAt: '2026-09-25T00:00:00Z',
    updatedAt: '2026-09-25T00:00:00Z',
    ...partial,
  };
}

class FakeSource implements AlertSourcePort {
  readonly id = 'FAKE';
  constructor(private readonly alerts: Alert[]) {}
  async fetchAlerts(): Promise<Alert[]> {
    return this.alerts;
  }
}

const PAGE = { page: 1, pageSize: 20 };

describe('AlertService', () => {
  const now = new Date('2026-09-25T12:00:00Z');
  const alerts: Alert[] = [
    fakeAlert({ id: 'low', severity: 1 }),
    fakeAlert({
      id: 'high-old',
      severity: 3,
      effectiveAt: '2026-09-24T00:00:00Z',
    }),
    fakeAlert({
      id: 'high-new',
      severity: 3,
      effectiveAt: '2026-09-25T00:00:00Z',
    }),
    fakeAlert({
      id: 'expired',
      severity: 4,
      status: 'active',
      expiresAt: '2026-09-20T00:00:00Z',
    }),
    fakeAlert({ id: 'closed', severity: 4, status: 'closed' }),
  ];

  it('sorts by severity desc then recency, and paginates', async () => {
    const service = new AlertService(new FakeSource(alerts));
    // severity 4 (expired/closed) sorts first — sorting is by severity,
    // visibility filtering is a separate concern (active filter).
    const page1 = await service.list({}, { page: 1, pageSize: 2 });
    expect(page1.items.map((a) => a.id)).toEqual(['expired', 'closed']);
    expect(page1.meta).toEqual({
      page: 1,
      pageSize: 2,
      total: 5,
      totalPages: 3,
    });

    const page3 = await service.list({}, { page: 3, pageSize: 2 });
    expect(page3.items.map((a) => a.id)).toEqual(['low']);
  });

  it('filters by severity, source, eventType, official and status', async () => {
    const service = new AlertService(new FakeSource(alerts));
    const sev3 = await service.list({ severity: 3 }, PAGE);
    expect(sev3.items).toHaveLength(2);
    const bySource = await service.list({ source: 'inmet' }, PAGE);
    expect(bySource.items).toHaveLength(5);
    const byEvent = await service.list({ eventType: 'heavy_rain' }, PAGE);
    expect(byEvent.items).toHaveLength(5);
    const closed = await service.list({ status: 'closed' }, PAGE);
    expect(closed.items.map((a) => a.id)).toEqual(['closed']);
  });

  it('active=true/false uses the validity window, not only status', async () => {
    const service = new AlertService(new FakeSource(alerts));
    const active = await service.list({ active: 'true' }, PAGE);
    expect(active.items.map((a) => a.id)).toEqual([
      'high-new',
      'high-old',
      'low',
    ]);
    const notActive = await service.list({ active: 'false' }, PAGE);
    expect(notActive.items.map((a) => a.id)).toEqual(['expired', 'closed']);
  });

  it('getById returns the alert or NOT_FOUND', async () => {
    const service = new AlertService(new FakeSource(alerts));
    const found = await service.getById('low');
    expect(found.id).toBe('low');
    await expect(service.getById('nope')).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });

  it('isActiveAlert requires active status and valid window', () => {
    expect(isActiveAlert(fakeAlert({ status: 'active' }), now)).toBe(true);
    expect(isActiveAlert(fakeAlert({ status: 'closed' }), now)).toBe(false);
    expect(
      isActiveAlert(
        fakeAlert({ status: 'active', expiresAt: '2026-09-01T00:00:00Z' }),
        now
      )
    ).toBe(false);
  });
});

describe('INMET → domain adapter', () => {
  const legacy: OfficialAlert = {
    id: 'inmet-55817',
    source: 'INMET',
    sourceType: 'OFFICIAL_WEATHER',
    externalId: '55817',
    title: 'Aviso de Onda de Calor',
    description: 'd',
    eventType: 'heat',
    severity: 'extreme',
    originalSeverity: 'Grande Perigo',
    status: 'active',
    effectiveAt: '2026-09-26T12:00:00Z',
    expiresAt: '2026-09-30T21:00:00Z',
    areas: [{ areaDesc: 'SP' }],
    isOfficial: true,
    isSimulated: false,
    sourceUrl: 'https://inmet',
    fetchedAt: '2026-09-25T00:00:00Z',
  };

  it('maps severity strings to the official 0–3 numeric scale', () => {
    const domain = toDomainAlert(legacy, 'INMET');
    expect(domain.severity).toBe(3);
    expect(domain.origin).toBe('OFFICIAL');
    expect(domain.status).toBe('active');
    expect(domain.createdAt).toBeDefined();
    expect(domain.updatedAt).toBeDefined();
  });

  it('maps legacy expired to domain closed', () => {
    const domain = toDomainAlert(
      { ...legacy, status: 'expired' },
      'INMET'
    );
    expect(domain.status).toBe('closed');
  });

  it('adapter surfaces provider alerts through the port', async () => {
    const stub = { fetchActiveAlerts: async () => [legacy] };
    const source = new InmetAlertSource(stub);
    const alerts = await source.fetchAlerts();
    expect(alerts).toHaveLength(1);
    expect(alerts[0].source).toBe('INMET');
  });
});

describe('Mock → domain adapter (honesty invariants)', () => {
  it('marks every simulated alert as not official and simulated', async () => {
    const source = new MockAlertSource();
    const alerts = await source.fetchAlerts();
    expect(alerts.length).toBeGreaterThanOrEqual(10);
    alerts.forEach((a) => {
      expect(a.isOfficial).toBe(false);
      expect(a.isSimulated).toBe(true);
      expect(a.source).toBe('MOCK');
      expect(a.severity).toBeGreaterThanOrEqual(0);
      expect(a.severity).toBeLessThanOrEqual(4);
    });
  });
});

describe('legacy wire mapping', () => {
  it('maps numeric severity to legacy strings (4→extreme fallback)', () => {
    expect(legacySeverity(0)).toBe('informative');
    expect(legacySeverity(1)).toBe('attention');
    expect(legacySeverity(2)).toBe('danger');
    expect(legacySeverity(3)).toBe('extreme');
    expect(legacySeverity(4)).toBe('extreme');
    expect(legacySeverity(99)).toBe('informative');
  });

  it('maps domain closed to legacy expired', () => {
    expect(legacyStatus('active')).toBe('active');
    expect(legacyStatus('closed')).toBe('expired');
  });
});

describe('ShelterService + InMemory repository', () => {
  let service: ShelterService;
  beforeEach(() => {
    service = new ShelterService(new InMemoryShelterRepository());
  });

  it('lists seeded simulated shelters with pagination meta', async () => {
    const page = await service.list({}, { page: 1, pageSize: 3 });
    expect(page.items).toHaveLength(3);
    expect(page.meta.total).toBe(mockShelters.length);
    page.items.forEach((s) => {
      expect(s.isSimulated).toBe(true);
      expect(s.source).toBe('MOCK');
    });
  });

  it('filters by status, search and boolean flags', async () => {
    const crowded = await service.list({ status: 'crowded' }, PAGE);
    expect(crowded.meta.total).toBeGreaterThan(0);
    crowded.items.forEach((s) => expect(s.status).toBe('crowded'));

    const searched = await service.list({ search: 'Petrópolis' }, PAGE);
    expect(searched.items.map((s) => s.id)).toContain('shelter-002');

    const accessible = await service.list({ accessible: 'true' }, PAGE);
    accessible.items.forEach((s) => expect(s.accessibility).toBe(true));
  });

  it('gets by id and 404s unknown ids', async () => {
    const shelter = await service.getById('shelter-001');
    expect(shelter.name).toBe('CEU Vila Guilherme');
    await expect(service.getById('nope')).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });
});

describe('IncidentService + InMemory repository', () => {
  let service: IncidentService;
  let repo: InMemoryIncidentRepository;

  beforeEach(() => {
    repo = new InMemoryIncidentRepository();
    service = new IncidentService(repo);
  });

  const validInput = {
    type: 'waterlogging' as const,
    description: 'Alagamento de 40 cm na avenida principal.',
    location: 'Av. Central, 100',
    roadBlocked: true,
    peopleAtRisk: 0,
    anonymous: false,
    consent: true as const,
  };

  it('creates with temporary demo id and pending status', async () => {
    const incident = await service.create(validInput);
    expect(incident.id).toMatch(/^inc-demo-\d{6}$/);
    expect(incident.status).toBe('pending');
    expect(incident.isSimulated).toBe(true);
    expect(incident.source).toBe('DEMO_APP');
    expect(incident.consent).toBe(true);
  });

  it('refuses to create without consent (defense in depth)', async () => {
    await expect(
      service.create({ ...validInput, consent: false as unknown as true })
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    expect((await repo.list()).length).toBe(0);
  });

  it('lists newest first and paginates', async () => {
    await service.create(validInput);
    await service.create({ ...validInput, location: 'Av. Segunda, 200' });
    const page = await service.list({}, { page: 1, pageSize: 1 });
    expect(page.items).toHaveLength(1);
    expect(page.meta.total).toBe(2);
    expect(page.meta.totalPages).toBe(2);
    const [first] = page.items;
    const { items: all } = await service.list();
    const sorted = [...all].sort((a, b) =>
      b.reportedAt.localeCompare(a.reportedAt)
    );
    expect(first.id).toBe(sorted[0].id);
  });

  it('getById 404s for unknown ids', async () => {
    await expect(service.getById('inc-demo-999999')).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });
});

describe('SourceService', () => {
  it('adapts the legacy health read-model to the domain contract', () => {
    const legacyPort = {
      getSourceHealth: () => ({
        source: 'INMET',
        status: 'ONLINE' as const,
        lastAttemptAt: '2026-09-25T00:00:00Z',
        lastSuccessAt: '2026-09-25T00:00:00Z',
        latencyMs: 615,
        errorCode: null,
        message: null,
      }),
    };
    const service = new SourceService(legacyPort);
    const health = service.getHealth();
    expect(health.id).toBe('INMET');
    expect(health.type).toBe('OFFICIAL_WEATHER');
    expect(health.status).toBe('ONLINE');
    expect(health.latencyMs).toBe(615);

    const sources = service.listSources();
    expect(sources).toHaveLength(1);
    expect(sources[0].name).toContain('INMET');
  });

  it('marks the demo source as DEMO type', () => {
    const service = new SourceService({
      getSourceHealth: () => ({
        source: 'MOCK',
        status: 'ONLINE' as const,
        lastAttemptAt: null,
        lastSuccessAt: null,
        latencyMs: null,
        errorCode: null,
        message: null,
      }),
    });
    expect(service.getHealth().type).toBe('DEMO');
  });
});

describe('HealthService', () => {
  it('liveness is always healthy and independent of sources', () => {
    const result = new HealthService().liveness();
    expect(result.status).toBe('healthy');
    expect(result.uptimeSeconds).toBeGreaterThanOrEqual(0);
  });

  it('readiness degrades (warn) without a database but fails on bad config', () => {
    const service = new HealthService();
    const ok = service.readiness('mock');
    expect(ok.status).toBe('degraded');
    expect(ok.checks.find((c) => c.name === 'database')?.status).toBe('warn');

    const bad = service.readiness('turbo-mode');
    expect(bad.status).toBe('unhealthy');
    expect(bad.checks.find((c) => c.name === 'config.dataMode')?.status).toBe(
      'fail'
    );
  });
});
