import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  AppError,
  toErrorBody,
} from '@/server/shared/errors/app-error';
import {
  isValidCorrelationId,
  resolveCorrelationId,
  generateCorrelationId,
} from '@/server/shared/ids/correlation';
import {
  paginationQuerySchema,
  parsePagination,
  buildPageMeta,
  paginate,
  MAX_PAGE_SIZE,
} from '@/server/shared/pagination';
import { RateLimiter } from '@/server/infrastructure/http/rate-limit';
import { alertSchema, alertFilterSchema } from '@/server/domain/alerts/alert.contract';
import { shelterSchema } from '@/server/domain/shelters/shelter.contract';
import {
  createIncidentSchema,
  incidentSchema,
} from '@/server/domain/incidents/incident.contract';
import {
  sensorSchema,
  observationSchema,
} from '@/server/domain/sensors/sensor.contract';

describe('AppError envelope', () => {
  it('maps each code to its HTTP status', () => {
    expect(AppError.validation('x').httpStatus).toBe(400);
    expect(AppError.notFound('x').httpStatus).toBe(404);
    expect(AppError.conflict('x').httpStatus).toBe(409);
    expect(AppError.rateLimited('x').httpStatus).toBe(429);
    expect(AppError.upstream('x').httpStatus).toBe(502);
    expect(AppError.internal('x').httpStatus).toBe(500);
    expect(AppError.unavailable('x').httpStatus).toBe(503);
  });

  it('produces the standard body with correlation id', () => {
    const error = AppError.notFound('Alerta não encontrado', { alertId: 'x' });
    const { status, body } = toErrorBody(error, 'corr-12345678');
    expect(status).toBe(404);
    expect(body.error).toMatchObject({
      code: 'NOT_FOUND',
      message: 'Alerta não encontrado',
      correlationId: 'corr-12345678',
      details: { alertId: 'x' },
    });
  });

  it('never exposes stack traces — unknown errors become INTERNAL_ERROR', () => {
    const { status, body } = toErrorBody(
      new Error('secret internal detail'),
      'corr-12345678'
    );
    expect(status).toBe(500);
    expect(body.error.code).toBe('INTERNAL_ERROR');
    expect(JSON.stringify(body)).not.toContain('secret internal detail');
    expect(JSON.stringify(body)).not.toContain('stack');
  });
});

describe('correlation id', () => {
  it('accepts safe tokens and rejects injection attempts', () => {
    expect(isValidCorrelationId('abc12345-def')).toBe(true);
    expect(isValidCorrelationId('a'.repeat(128))).toBe(true);
    expect(isValidCorrelationId(null)).toBe(false);
    expect(isValidCorrelationId('short')).toBe(false);
    expect(isValidCorrelationId('has space inside')).toBe(false);
    expect(isValidCorrelationId('injection\nfoo: bar')).toBe(false);
    expect(isValidCorrelationId('a'.repeat(129))).toBe(false);
  });

  it('reuses the incoming header when valid, generates otherwise', () => {
    const req = new Request('http://localhost/api', {
      headers: { 'x-correlation-id': 'incoming-12345' },
    });
    expect(resolveCorrelationId(req)).toBe('incoming-12345');

    const clean = new Request('http://localhost/api');
    const generated = resolveCorrelationId(clean);
    expect(generated).toMatch(/^[0-9a-f-]{36}$/);
    expect(generateCorrelationId()).not.toBe(generateCorrelationId());
  });
});

describe('pagination', () => {
  it('applies defaults', () => {
    const parsed = parsePagination(new URLSearchParams());
    expect(parsed).toEqual({ page: 1, pageSize: 20 });
  });

  it('rejects out-of-range values with VALIDATION_ERROR', () => {
    expect(() =>
      parsePagination(new URLSearchParams({ page: '0' }))
    ).toThrowError(AppError);
    expect(() =>
      parsePagination(new URLSearchParams({ pageSize: String(MAX_PAGE_SIZE + 1) }))
    ).toThrowError(AppError);
    expect(() =>
      parsePagination(new URLSearchParams({ page: 'abc' }))
    ).toThrowError(AppError);
  });

  it('builds meta and slices pages', () => {
    const query = paginationQuerySchema.parse({ page: 2, pageSize: 3 });
    const meta = buildPageMeta(10, query);
    expect(meta).toEqual({ page: 2, pageSize: 3, total: 10, totalPages: 4 });
    const items = paginate([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], query);
    expect(items).toEqual([4, 5, 6]);
    expect(buildPageMeta(0, query).totalPages).toBe(0);
  });
});

describe('rate limiter', () => {
  it('allows up to the limit then blocks with retry hint', () => {
    const limiter = new RateLimiter({ limit: 3, windowMs: 60_000 });
    const now = 1_000_000;
    expect(limiter.check('k', now).allowed).toBe(true);
    expect(limiter.check('k', now).allowed).toBe(true);
    const third = limiter.check('k', now);
    expect(third.allowed).toBe(true);
    expect(third.remaining).toBe(0);
    const fourth = limiter.check('k', now + 1000);
    expect(fourth.allowed).toBe(false);
    expect(fourth.retryAfterSeconds).toBeGreaterThan(0);
    expect(() => limiter.enforce('k', now + 1000)).toThrowError(AppError);
  });

  it('opens a new window after it elapses', () => {
    const limiter = new RateLimiter({ limit: 1, windowMs: 5_000 });
    expect(limiter.check('k', 0).allowed).toBe(true);
    expect(limiter.check('k', 1000).allowed).toBe(false);
    expect(limiter.check('k', 5001).allowed).toBe(true);
  });

  it('isolates keys', () => {
    const limiter = new RateLimiter({ limit: 1, windowMs: 60_000 });
    expect(limiter.check('a', 0).allowed).toBe(true);
    expect(limiter.check('b', 0).allowed).toBe(true);
  });
});

describe('domain schemas', () => {
  const validAlert = {
    id: 'inmet-1',
    externalId: '1',
    source: 'INMET',
    sourceType: 'OFFICIAL_WEATHER',
    origin: 'OFFICIAL',
    eventType: 'heavy_rain',
    severity: 2,
    originalSeverity: 'Perigo',
    status: 'active',
    title: 'Aviso',
    description: 'Chuva forte.',
    areas: [{ areaDesc: 'Região' }],
    isOfficial: true,
    isSimulated: false,
    sourceUrl: 'https://x',
    fetchedAt: '2026-09-25T00:00:00Z',
    createdAt: '2026-09-25T00:00:00Z',
    updatedAt: '2026-09-25T00:00:00Z',
  };

  it('accepts a valid alert and rejects severity 5', () => {
    expect(alertSchema.safeParse(validAlert).success).toBe(true);
    const bad = alertSchema.safeParse({ ...validAlert, severity: 5 });
    expect(bad.success).toBe(false);
    const badOrigin = alertSchema.safeParse({ ...validAlert, origin: 'ALIEN' });
    expect(badOrigin.success).toBe(false);
  });

  it('accepts a valid shelter and marks isSimulated as literal', () => {
    const shelter = {
      id: 's1',
      name: 'Abrigo',
      address: 'Rua 1',
      capacity: 100,
      estimatedVacancies: 50,
      status: 'open',
      accessibility: true,
      acceptsAnimals: false,
      foodAvailable: true,
      medicalSupport: false,
      phone: null,
      lastUpdatedAt: '2026-09-25T00:00:00Z',
      source: 'MOCK',
      isSimulated: true as const,
      createdAt: '2026-09-25T00:00:00Z',
      updatedAt: '2026-09-25T00:00:00Z',
    };
    expect(shelterSchema.safeParse(shelter).success).toBe(true);
    expect(
      shelterSchema.safeParse({ ...shelter, isSimulated: false }).success
    ).toBe(false);
  });

  it('requires consent literally true and bounds description length', () => {
    const base = {
      type: 'flood',
      location: 'Rua das Flores, 100',
      consent: true,
    };
    const ok = createIncidentSchema.safeParse({
      ...base,
      description: 'Alagamento de 50 cm na via.',
    });
    expect(ok.success).toBe(true);

    const noConsent = createIncidentSchema.safeParse({
      ...base,
      description: 'Alagamento de 50 cm na via.',
      consent: false,
    });
    expect(noConsent.success).toBe(false);

    const long = createIncidentSchema.safeParse({
      ...base,
      description: 'a'.repeat(2001),
    });
    expect(long.success).toBe(false);
  });

  it('keeps incident status within the domain pipeline states', () => {
    const parsed = incidentSchema.pick({ status: true }).safeParse({ status: 'pending' });
    expect(parsed.success).toBe(true);
  });

  it('validates sensor and observation contracts', () => {
    const sensor = {
      id: 'RIO-001',
      externalId: 'RIO-001',
      name: 'Sensor Rio',
      type: 'river_level',
      status: 'online',
      createdAt: '2026-09-25T00:00:00Z',
      updatedAt: '2026-09-25T00:00:00Z',
    };
    expect(sensorSchema.safeParse(sensor).success).toBe(true);

    const observation = {
      id: 'obs-1',
      sensorId: 'RIO-001',
      value: 7.8,
      unit: 'm',
      observedAt: '2026-09-25T00:00:00Z',
      receivedAt: '2026-09-25T00:00:01Z',
      quality: 'raw',
      metadata: { battery: 3.7 },
    };
    expect(observationSchema.safeParse(observation).success).toBe(true);
    expect(
      observationSchema.safeParse({ ...observation, quality: 'nope' }).success
    ).toBe(false);
  });

  it('parses alert filters with coercion and defaults to no filter', () => {
    const parsed = alertFilterSchema.parse({ severity: '2', active: 'true' });
    expect(parsed).toEqual({ severity: 2, active: 'true' });
    expect(alertFilterSchema.parse({})).toEqual({});
    // Unknown filter keys are rejected (strict).
    expect(alertFilterSchema.safeParse({ hacker: '1' }).success).toBe(false);
  });

  it('zod is available as the validation engine', () => {
    expect(z.string().safeParse('x').success).toBe(true);
  });
});
