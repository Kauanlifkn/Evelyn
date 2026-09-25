import { alertFilterSchema } from '@/server/domain/alerts/alert.contract';
import { getServices, getDataMode } from '@/server/infrastructure/composition';
import { jsonResponse, withRoute } from '@/server/infrastructure/http/route';
import { buildPageMeta } from '@/server/shared/pagination';
import { parsePagination } from '@/server/shared/pagination';
import { parseWithSchema } from '@/server/shared/validation';

export const dynamic = 'force-dynamic';

export const GET = withRoute('/api/v1/alerts', async (request) => {
  const { alertService, sourceService } = getServices();
  const url = new URL(request.url);
  const rawFilters: Record<string, string> = {};
  for (const key of ['source', 'severity', 'eventType', 'status', 'official', 'active']) {
    const value = url.searchParams.get(key);
    if (value !== null) rawFilters[key] = value;
  }
  const filter = parseWithSchema(alertFilterSchema, rawFilters, 'filtros de alertas');
  const pagination = parsePagination(url.searchParams);

  const { items, meta } = await alertService.list(filter, pagination);
  const health = await sourceService.getHealth();

  return jsonResponse({
    data: items,
    meta: {
      ...buildPageMeta(meta.total, pagination),
      source: health.id,
      isOfficial: health.id !== 'MOCK',
      sourceStatus: health.status,
      dataMode: getDataMode(),
    },
  });
});
