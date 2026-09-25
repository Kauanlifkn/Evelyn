/**
 * GET /api/sources/status (LEGACY — kept for compatibility, RECOVERY-2).
 * Delegates to SourceService; preserves the legacy response shape.
 */

import { getServices, getDataMode } from '@/server/infrastructure/composition';
import { withRoute } from '@/server/infrastructure/http/route';

export const dynamic = 'force-dynamic';

export const GET = withRoute('/api/sources/status', async () => {
  const { sourceService } = getServices();
  const health = await sourceService.getHealth();

  return Response.json({
    sources: [
      {
        source: health.id,
        status: health.status,
        lastAttemptAt: health.lastAttemptAt,
        lastSuccessAt: health.lastSuccessAt,
        latencyMs: health.latencyMs,
        errorCode: health.errorCode,
        message: health.message,
      },
    ],
    dataMode: getDataMode(),
  });
});
