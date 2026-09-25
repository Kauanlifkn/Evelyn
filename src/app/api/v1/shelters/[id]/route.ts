import { shelterIdParamSchema } from '@/server/domain/shelters/shelter.contract';
import { getServices } from '@/server/infrastructure/composition';
import { jsonResponse, withRoute } from '@/server/infrastructure/http/route';
import { parseWithSchema } from '@/server/shared/validation';

export const dynamic = 'force-dynamic';

export const GET = withRoute(
  '/api/v1/shelters/[id]',
  async (_request, { params }) => {
    const { id } = parseWithSchema(shelterIdParamSchema, params, 'parâmetros de rota');
    const { shelterService } = getServices();
    const shelter = await shelterService.getById(id);
    return jsonResponse({ data: shelter });
  }
);
