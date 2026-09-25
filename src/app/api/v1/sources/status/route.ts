import { sourceHealthSchema } from '@/server/domain/sources/sources.contract';
import { getServices, getDataMode } from '@/server/infrastructure/composition';
import { jsonResponse, withRoute } from '@/server/infrastructure/http/route';
import { parseWithSchema } from '@/server/shared/validation';

export const dynamic = 'force-dynamic';

export const GET = withRoute('/api/v1/sources/status', async () => {
  const { sourceService } = getServices();
  const health = sourceService.getHealth();

  // Contract test guard: the exposed object must match the domain schema.
  parseWithSchema(sourceHealthSchema, health, 'source health');

  return jsonResponse({
    data: [health],
    meta: { dataMode: getDataMode() },
  });
});
