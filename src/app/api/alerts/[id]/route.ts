/**
 * GET /api/alerts/[id] (LEGACY — kept for compatibility, RECOVERY-2).
 * Delegates to AlertService; preserves the legacy 404 JSON shape.
 */

import { AppError } from '@/server/shared/errors/app-error';
import { getServices } from '@/server/infrastructure/composition';
import { withRoute } from '@/server/infrastructure/http/route';
import { SEVERITY_TO_LEGACY } from '@/server/infrastructure/providers/alerts/legacy-mapping';

export const dynamic = 'force-dynamic';

export const GET = withRoute(
  '/api/alerts/[id]',
  async (_request, { params }) => {
    const { alertService } = getServices();
    try {
      const alert = await alertService.getById(params.id ?? '');
      return Response.json({
        data: {
          ...alert,
          severity:
            SEVERITY_TO_LEGACY[alert.severity] ?? SEVERITY_TO_LEGACY[0],
          status: alert.status === 'closed' ? 'expired' : 'active',
        },
      });
    } catch (error) {
      if (error instanceof AppError && error.code === 'NOT_FOUND') {
        // Legacy error shape preserved on purpose.
        return Response.json(
          { error: 'Alert not found', id: params.id ?? '' },
          { status: 404 }
        );
      }
      throw error;
    }
  }
);
