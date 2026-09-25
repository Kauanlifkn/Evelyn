import { shelterFilterSchema } from '@/server/domain/shelters/shelter.contract';
import { getServices } from '@/server/infrastructure/composition';
import { jsonResponse, withRoute } from '@/server/infrastructure/http/route';
import { buildPageMeta, parsePagination } from '@/server/shared/pagination';
import { parseWithSchema } from '@/server/shared/validation';

export const dynamic = 'force-dynamic';

export const GET = withRoute('/api/v1/shelters', async (request) => {
  const { shelterService } = getServices();
  const url = new URL(request.url);
  const rawFilters: Record<string, string> = {};
  for (const key of ['status', 'city', 'search', 'accessible', 'acceptsAnimals']) {
    const value = url.searchParams.get(key);
    if (value !== null) rawFilters[key] = value;
  }
  const filter = parseWithSchema(shelterFilterSchema, rawFilters, 'filtros de abrigos');
  const pagination = parsePagination(url.searchParams);

  const { items, meta } = await shelterService.list(filter, pagination);
  return jsonResponse({ data: items, meta: buildPageMeta(meta.total, pagination) });
});
