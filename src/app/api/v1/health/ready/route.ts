import { getServices, getDataMode } from '@/server/infrastructure/composition';
import { persistenceDriver, pingDatabase, postgisVersion } from '@/server/infrastructure/db/client';
import { pingRedis } from '@/server/infrastructure/redis/client';
import { jsonResponse, withRoute } from '@/server/infrastructure/http/route';

export const dynamic = 'force-dynamic';

/**
 * READINESS (RECOVERY-3): evaluates PostgreSQL, PostGIS, Redis and config.
 * - PostgreSQL down → unhealthy (503).
 * - PostGIS missing → unhealthy (503) — required by doc §10.2.
 * - Redis down → degraded warn (fail-open policy; rate limiter falls back).
 * - INMET status is reported as a source check and never fails readiness.
 */
export const GET = withRoute('/api/v1/health/ready', async () => {
  const { healthService, sourceService } = getServices();
  const driver = persistenceDriver();
  const readiness = healthService.readiness(getDataMode());
  const checks: Array<{ name: string; status: 'pass' | 'fail' | 'warn'; message?: string }> = [
    ...readiness.checks,
  ];

  if (driver === 'postgres') {
    let dbOk = false;
    try {
      dbOk = await pingDatabase();
    } catch {
      dbOk = false;
    }
    checks.push({
      name: 'database',
      status: dbOk ? 'pass' : 'fail',
      message: dbOk ? 'PostgreSQL responde' : 'PostgreSQL inacessível',
    });

    if (dbOk) {
      const version = await postgisVersion();
      checks.push({
        name: 'postgis',
        status: version ? 'pass' : 'fail',
        message: version ? `PostGIS ${version}` : 'extensão PostGIS ausente',
      });
    }
  } else {
    checks.push({
      name: 'database',
      status: 'warn',
      message: 'driver em memória (PERSISTENCE_DRIVER=memory)',
    });
  }

  const redisOk = await pingRedis();
  checks.push({
    name: 'redis',
    status: redisOk ? 'pass' : 'warn',
    message: redisOk
      ? 'Redis responde'
      : 'Redis indisponível — rate limit usa fallback em memória (documentado)',
  });

  try {
    const source = await sourceService.getHealth();
    checks.push({
      name: 'sources',
      status: source.status === 'OFFLINE' ? 'warn' : 'pass',
      message: `${source.id}: ${source.status}`,
    });
  } catch {
    checks.push({ name: 'sources', status: 'warn', message: 'snapshot indisponível' });
  }

  const failed = checks.some((c) => c.status === 'fail');
  const warned = checks.some((c) => c.status === 'warn');
  const status = failed ? 'unhealthy' : warned ? 'degraded' : 'healthy';
  const httpStatus = failed ? 503 : 200;

  return jsonResponse(
    { data: { status, checks, checkedAt: new Date().toISOString() } },
    httpStatus
  );
});
