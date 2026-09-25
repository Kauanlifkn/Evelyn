/**
 * GET /api/health (LEGACY — kept for compatibility, RECOVERY-2).
 * Delegates to SourceService; passive semantics preserved (this endpoint
 * does NOT trigger a provider fetch — warm /api/alerts first). The new
 * split endpoints are /api/v1/health/live and /api/v1/health/ready.
 */

import { getServices, getDataMode } from '@/server/infrastructure/composition';
import { withRoute } from '@/server/infrastructure/http/route';

export const dynamic = 'force-dynamic';

export const GET = withRoute('/api/health', async () => {
  const { sourceService } = getServices();
  const health = await sourceService.getHealth();

  const isHealthy = health.status === 'ONLINE' || health.status === 'STALE';

  return Response.json(
    {
      status: isHealthy ? 'healthy' : 'degraded',
      source: health.id,
      sourceStatus: health.status,
      latencyMs: health.latencyMs,
      lastSuccessAt: health.lastSuccessAt,
      dataMode: getDataMode(),
      timestamp: new Date().toISOString(),
    },
    { status: isHealthy ? 200 : 503 }
  );
});
