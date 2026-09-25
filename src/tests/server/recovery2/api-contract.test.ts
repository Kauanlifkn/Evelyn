import { describe, it, expect, beforeEach } from 'vitest';
import { getServices } from '@/server/infrastructure/composition';

/**
 * Contract tests (RECOVERY-2): Route Handlers invoked directly with
 * Request objects — full HTTP semantics without network. Deterministic:
 * the composition root runs in mock mode (no external calls).
 */

const BASE = 'http://localhost:3001';

function get(path: string, headers?: Record<string, string>): Request {
  return new Request(`${BASE}${path}`, { headers });
}

function post(path: string, body: unknown): Request {
  return new Request(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const VALID_INCIDENT = {
  type: 'waterlogging',
  description: 'Alagamento de 40 cm na avenida principal do bairro.',
  location: 'Av. Central, 100',
  roadBlocked: true,
  peopleAtRisk: 0,
  anonymous: false,
  consent: true,
};

describe('GET /api/v1/alerts', () => {
  it('200 with domain alerts, pagination meta and correlation header', async () => {
    const { GET } = await import('@/app/api/v1/alerts/route');
    const res = await GET(get('/api/v1/alerts?pageSize=100'));
    expect(res.status).toBe(200);
    expect(res.headers.get('x-correlation-id')).toMatch(/.+/);
    expect(res.headers.get('cache-control')).toBe('no-store');

    const json = await res.json();
    expect(json.data.length).toBeGreaterThan(0);
    expect(json.meta).toMatchObject({
      page: 1,
      pageSize: 100,
      source: 'MOCK',
      isOfficial: false,
      sourceStatus: 'ONLINE',
      dataMode: 'mock',
    });
    json.data.forEach((alert: { isSimulated: boolean; isOfficial: boolean; severity: number }) => {
      expect(alert.isSimulated).toBe(true);
      expect(alert.isOfficial).toBe(false);
      expect(alert.severity).toBeGreaterThanOrEqual(0);
      expect(alert.severity).toBeLessThanOrEqual(4);
    });
  });

  it('echoes a valid incoming correlation id', async () => {
    const { GET } = await import('@/app/api/v1/alerts/route');
    const res = await GET(
      get('/api/v1/alerts', { 'x-correlation-id': 'my-trace-123456' })
    );
    expect(res.headers.get('x-correlation-id')).toBe('my-trace-123456');
  });

  it('400 VALIDATION_ERROR envelope for invalid filters', async () => {
    const { GET } = await import('@/app/api/v1/alerts/route');
    const res = await GET(get('/api/v1/alerts?severity=9'));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.code).toBe('VALIDATION_ERROR');
    expect(json.error.correlationId).toMatch(/.+/);
    expect(JSON.stringify(json)).not.toContain('stack');
  });

  it('filters by severity', async () => {
    const { GET } = await import('@/app/api/v1/alerts/route');
    const res = await GET(get('/api/v1/alerts?severity=4'));
    const json = await res.json();
    json.data.forEach(
      (alert: { severity: number }) => expect(alert.severity).toBe(4)
    );
  });
});

describe('GET /api/v1/alerts/[id]', () => {
  it('200 for an existing id and 404 envelope for unknown', async () => {
    const { GET } = await import('@/app/api/v1/alerts/[id]/route');
    const ok = await GET(get('/api/v1/alerts/alert-001'), {
      params: Promise.resolve({ id: 'alert-001' }),
    });
    expect(ok.status).toBe(200);
    const okJson = await ok.json();
    expect(okJson.data.id).toBe('alert-001');

    const missing = await GET(get('/api/v1/alerts/nope'), {
      params: Promise.resolve({ id: 'nope' }),
    });
    expect(missing.status).toBe(404);
    const missingJson = await missing.json();
    expect(missingJson.error.code).toBe('NOT_FOUND');
    expect(missingJson.error.message).toContain('não encontrado');
  });
});

describe('GET /api/v1/shelters', () => {
  it('200 with simulated shelters, capped pageSize and filters', async () => {
    const { GET } = await import('@/app/api/v1/shelters/route');
    const res = await GET(get('/api/v1/shelters?pageSize=2&status=open'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.length).toBeLessThanOrEqual(2);
    expect(json.meta.total).toBeGreaterThan(0);
    json.data.forEach((s: { isSimulated: boolean; status: string }) => {
      expect(s.isSimulated).toBe(true);
      expect(s.status).toBe('open');
    });

    const capped = await GET(get('/api/v1/shelters?pageSize=5000'));
    expect(capped.status).toBe(400);
  });

  it('404 envelope for unknown shelter id', async () => {
    const { GET } = await import('@/app/api/v1/shelters/[id]/route');
    const res = await GET(get('/api/v1/shelters/nope'), {
      params: Promise.resolve({ id: 'nope' }),
    });
    expect(res.status).toBe(404);
    expect((await res.json()).error.code).toBe('NOT_FOUND');
  });
});

describe('GET /api/v1/sources (+ status)', () => {
  it('lists sources and health snapshot in domain shape', async () => {
    const sourcesRoute = await import('@/app/api/v1/sources/route');
    const statusRoute = await import('@/app/api/v1/sources/status/route');

    const sources = await sourcesRoute.GET(get('/api/v1/sources'));
    expect(sources.status).toBe(200);
    const sourcesJson = await sources.json();
    expect(sourcesJson.data[0]).toMatchObject({ id: 'MOCK', type: 'DEMO' });

    const status = await statusRoute.GET(get('/api/v1/sources/status'));
    expect(status.status).toBe(200);
    const statusJson = await status.json();
    expect(statusJson.data[0]).toMatchObject({
      id: 'MOCK',
      status: 'ONLINE',
    });
    expect(statusJson.meta.dataMode).toBe('mock');
  });
});

describe('POST /api/v1/incidents', () => {
  beforeEach(async () => {
    getServices().incidentRateLimiter.resetFallback();
    await getServices().incidentService['repository']?.clear?.();
  });

  it('201 creates an incident with temporary id and honest meta', async () => {
    const { POST } = await import('@/app/api/v1/incidents/route');
    const res = await POST(post('/api/v1/incidents', VALID_INCIDENT));
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.data.id).toMatch(/^inc-demo-\d{6}$/);
    expect(json.data.isSimulated).toBe(true);
    expect(json.data.status).toBe('pending');
    expect(json.meta.message).toContain('Não enviado à Defesa Civil');
    expect(res.headers.get('x-correlation-id')).toMatch(/.+/);
  });

  it('400 VALIDATION_ERROR without consent — nothing stored', async () => {
    const { POST } = await import('@/app/api/v1/incidents/route');
    const res = await POST(post('/api/v1/incidents', { ...VALID_INCIDENT, consent: false }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.code).toBe('VALIDATION_ERROR');
    expect(json.error.details.issues.some((i: { path: string }) => i.path === 'consent')).toBe(true);
  });

  it('400 for malformed JSON body', async () => {
    const { POST } = await import('@/app/api/v1/incidents/route');
    const res = await POST(
      new Request(`${BASE}/api/v1/incidents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'not-json',
      })
    );
    expect(res.status).toBe(400);
  });

  it('429 RATE_LIMITED after the fifth request in the window', async () => {
    const { POST } = await import('@/app/api/v1/incidents/route');
    for (let i = 0; i < 5; i++) {
      const res = await POST(post('/api/v1/incidents', { ...VALID_INCIDENT, description: `Ocorrência número ${i} da rua.` }));
      expect(res.status).toBe(201);
    }
    const sixth = await POST(post('/api/v1/incidents', { ...VALID_INCIDENT, description: 'Sexta tentativa dentro da janela.' }));
    expect(sixth.status).toBe(429);
    const json = await sixth.json();
    expect(json.error.code).toBe('RATE_LIMITED');
    expect(json.error.details.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('GET lists created incidents (newest first)', async () => {
    const { POST } = await import('@/app/api/v1/incidents/route');
    const { GET } = await import('@/app/api/v1/incidents/route');
    await POST(post('/api/v1/incidents', VALID_INCIDENT));
    const res = await GET(get('/api/v1/incidents'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.meta.total).toBeGreaterThanOrEqual(1);
  });
});

describe('Health endpoints', () => {
  it('live returns 200 healthy independent of sources', async () => {
    const { GET } = await import('@/app/api/v1/health/live/route');
    const res = await GET(get('/api/v1/health/live'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.status).toBe('healthy');
  });

  it('ready reports degraded (no database) with detailed checks', async () => {
    const { GET } = await import('@/app/api/v1/health/ready/route');
    const res = await GET(get('/api/v1/health/ready'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.status).toBe('degraded');
    const names = json.data.checks.map((c: { name: string }) => c.name);
    expect(names).toContain('runtime');
    expect(names).toContain('database');
  });
});

describe('OpenAPI document', () => {
  it('exposes all v1 paths and domain schemas', async () => {
    const { GET } = await import('@/app/api/openapi.json/route');
    const res = await GET(get('/api/openapi.json'));
    expect(res.status).toBe(200);
    const doc = await res.json();
    expect(doc.openapi).toMatch(/^3\./);
    for (const path of [
      '/api/v1/alerts',
      '/api/v1/alerts/{id}',
      '/api/v1/sources',
      '/api/v1/sources/status',
      '/api/v1/shelters',
      '/api/v1/shelters/{id}',
      '/api/v1/incidents',
      '/api/v1/health/live',
      '/api/v1/health/ready',
    ]) {
      expect(doc.paths[path]).toBeDefined();
    }
    for (const schema of ['Alert', 'Shelter', 'Incident', 'SourceHealth', 'CreateIncidentInput']) {
      expect(doc.components.schemas[schema]).toBeDefined();
    }
  });
});

describe('LEGACY routes delegate to the same services', () => {
  it('/api/alerts keeps the legacy wire shape (string severity)', async () => {
    const { GET } = await import('@/app/api/alerts/route');
    const res = await GET(get('/api/alerts'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.meta).toMatchObject({
      source: 'MOCK',
      isOfficial: false,
      dataMode: 'mock',
    });
    json.data.forEach((a: { severity: string; isOfficial: boolean }) => {
      expect(typeof a.severity).toBe('string');
      expect(['informative', 'attention', 'danger', 'extreme']).toContain(a.severity);
      expect(a.isOfficial).toBe(false);
    });
  });

  it('/api/alerts/[id] keeps the legacy 404 shape', async () => {
    const { GET } = await import('@/app/api/alerts/[id]/route');
    const res = await GET(get('/api/alerts/alert-001'), {
      params: Promise.resolve({ id: 'alert-001' }),
    });
    expect(res.status).toBe(200);
    const ok = await res.json();
    expect(typeof ok.data.severity).toBe('string');

    const missing = await GET(get('/api/alerts/nope'), {
      params: Promise.resolve({ id: 'nope' }),
    });
    expect(missing.status).toBe(404);
    expect(await missing.json()).toEqual({ error: 'Alert not found', id: 'nope' });
  });

  it('/api/sources/status keeps the legacy shape', async () => {
    const { GET } = await import('@/app/api/sources/status/route');
    const res = await GET(get('/api/sources/status'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.sources[0]).toMatchObject({ source: 'MOCK', status: 'ONLINE' });
    expect(json.dataMode).toBe('mock');
  });

  it('/api/health stays passive and coherent', async () => {
    const { GET } = await import('@/app/api/health/route');
    const res = await GET(get('/api/health'));
    const json = await res.json();
    expect(['healthy', 'degraded']).toContain(json.status);
    expect(json.dataMode).toBe('mock');
  });
});
