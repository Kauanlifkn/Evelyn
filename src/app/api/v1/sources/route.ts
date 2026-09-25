import { getServices } from '@/server/infrastructure/composition';
import { jsonResponse, withRoute } from '@/server/infrastructure/http/route';

export const dynamic = 'force-dynamic';

export const GET = withRoute('/api/v1/sources', async () => {
  const { sourceService } = getServices();
  const sources = await sourceService.listSources();
  return jsonResponse({ data: sources, meta: { count: sources.length } });
});
