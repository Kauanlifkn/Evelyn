import { alertIdParamSchema } from '@/server/domain/alerts/alert.contract';
import { getServices } from '@/server/infrastructure/composition';
import { jsonResponse, withRoute } from '@/server/infrastructure/http/route';
import { parseWithSchema } from '@/server/shared/validation';

export const dynamic = 'force-dynamic';

export const GET = withRoute(
  '/api/v1/alerts/[id]',
  async (_request, { correlationId, params }) => {
    const { id } = parseWithSchema(alertIdParamSchema, params, 'parâmetros de rota');
    const { alertService } = getServices();
    const alert = await alertService.getById(id);
    return jsonResponse(
      { data: alert, meta: { correlationId } },
      200
    );
  }
);
