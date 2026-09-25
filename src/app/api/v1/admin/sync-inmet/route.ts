import { syncInmetAlerts } from '@/server/infrastructure/sync/inmet-sync';
import { jsonResponse, withRoute } from '@/server/infrastructure/http/route';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/admin/sync-inmet — DEV/OPERATIONS ONLY.
 *
 * Manual trigger for the INMET → DB sync (a scheduler/worker can call the
 * same service in production). Protected by the `x-admin-token` header,
 * compared against ADMIN_SYNC_TOKEN. Disabled (404) when the token is not
 * configured — the endpoint never exists publicly by accident.
 */
export const POST = withRoute('/api/v1/admin/sync-inmet', async (request) => {
  const expected = process.env.ADMIN_SYNC_TOKEN;
  if (!expected || request.headers.get('x-admin-token') !== expected) {
    return jsonResponse(
      { error: { code: 'NOT_FOUND', message: 'Rota não disponível.', correlationId: 'n/a' } },
      404
    );
  }

  const result = await syncInmetAlerts();
  return jsonResponse({ data: result }, result.ran ? 200 : 409);
});
