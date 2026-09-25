/**
 * GET /api/alerts (LEGACY — kept for compatibility, RECOVERY-2).
 *
 * Delegates to the same AlertService/SourceService used by /api/v1 and
 * maps the domain contract back to the legacy wire shape (string severity)
 * so existing consumers do not break. New integrations should use
 * /api/v1/alerts.
 */

import { getServices, getDataMode } from '@/server/infrastructure/composition';
import { withRoute } from '@/server/infrastructure/http/route';
import { legacySeverity, legacyStatus } from '@/server/infrastructure/providers/alerts/legacy-mapping';

export const dynamic = 'force-dynamic';

export const GET = withRoute('/api/alerts', async () => {
  const { alertService, sourceService } = getServices();
  const { items } = await alertService.list(
    {},
    { page: 1, pageSize: 100 }
  );
  const health = sourceService.getHealth();

  const legacyData = items.map((a) => ({
    id: a.id,
    source: a.source,
    sourceType: a.sourceType,
    externalId: a.externalId,
    title: a.title,
    description: a.description,
    instruction: a.instruction,
    eventType: a.eventType,
    severity: legacySeverity(a.severity),
    originalSeverity: a.originalSeverity,
    status: legacyStatus(a.status),
    issuedAt: a.issuedAt,
    effectiveAt: a.effectiveAt,
    expiresAt: a.expiresAt,
    areas: a.areas,
    isOfficial: a.isOfficial,
    isSimulated: a.isSimulated,
    sourceUrl: a.sourceUrl,
    fetchedAt: a.fetchedAt,
  }));

  return Response.json({
    data: legacyData,
    meta: {
      source: health.id,
      isOfficial: health.id !== 'MOCK',
      fetchedAt: health.lastSuccessAt,
      count: legacyData.length,
      totalCount: legacyData.length,
      sourceStatus: health.status,
      dataMode: getDataMode(),
    },
  });
});
