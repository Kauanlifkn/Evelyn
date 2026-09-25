import { buildOpenApiDocument } from '@/server/infrastructure/http/openapi';
import { jsonResponse, withRoute } from '@/server/infrastructure/http/route';

export const dynamic = 'force-dynamic';

export const GET = withRoute('/api/openapi.json', async (request) => {
  const url = new URL(request.url);
  const document = buildOpenApiDocument(url.origin);
  return jsonResponse(document);
});
