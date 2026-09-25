import { getServices } from '@/server/infrastructure/composition';
import { jsonResponse, withRoute } from '@/server/infrastructure/http/route';

export const dynamic = 'force-dynamic';

export const GET = withRoute('/api/v1/health/live', async () => {
  const { healthService } = getServices();
  const liveness = healthService.liveness();
  return jsonResponse({ data: liveness });
});
