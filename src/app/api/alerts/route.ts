/**
 * GET /api/alerts
 *
 * Returns active official alerts from the configured provider.
 * Response includes metadata about source and timing.
 */

import { NextResponse } from 'next/server';
import { getAlertProvider, getAlertDataMode } from '@/server/providers/alerts';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const provider = getAlertProvider();
    const alerts = await provider.fetchActiveAlerts();
    const activeAlerts = alerts.filter((a) => a.status === 'active');
    const health = provider.getSourceHealth();

    return NextResponse.json({
      data: activeAlerts,
      meta: {
        source: health.source,
        isOfficial: health.source !== 'MOCK',
        fetchedAt: health.lastSuccessAt,
        count: activeAlerts.length,
        totalCount: alerts.length,
        sourceStatus: health.status,
        dataMode: getAlertDataMode(),
      },
    });
  } catch (error) {
    console.error('[/api/alerts] Unexpected error:', error);
    return NextResponse.json(
      {
        data: [],
        meta: {
          source: 'UNKNOWN',
          isOfficial: false,
          fetchedAt: null,
          count: 0,
          totalCount: 0,
          sourceStatus: 'OFFLINE',
          dataMode: getAlertDataMode(),
          error: 'Internal server error',
        },
      },
      { status: 500 }
    );
  }
}
