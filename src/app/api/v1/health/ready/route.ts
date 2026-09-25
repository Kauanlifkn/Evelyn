import { getServices, getDataMode } from '@/server/infrastructure/composition';
import { jsonResponse, withRoute } from '@/server/infrastructure/http/route';

export const dynamic = 'force-dynamic';

export const GET = withRoute('/api/v1/health/ready', async () => {
  const { healthService } = getServices();
  const readiness = healthService.readiness(getDataMode());
  // Without a database there is nothing hard-failing readiness; 'degraded'
  // (warn) still answers 200. 'unhealthy' (config error) answers 503.
  const status = readiness.status === 'unhealthy' ? 503 : 200;
  return jsonResponse({ data: readiness }, status);
});
