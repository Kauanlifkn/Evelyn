/**
 * GET /api/health
 *
 * Simple health check endpoint.
 */

import { NextResponse } from 'next/server';
import { getAlertProvider, getAlertDataMode } from '@/server/providers/alerts';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const provider = getAlertProvider();
    const health = provider.getSourceHealth();

    const isHealthy = health.status === 'ONLINE' || health.status === 'STALE';

    return NextResponse.json(
      {
        status: isHealthy ? 'healthy' : 'degraded',
        source: health.source,
        sourceStatus: health.status,
        latencyMs: health.latencyMs,
        lastSuccessAt: health.lastSuccessAt,
        dataMode: getAlertDataMode(),
        timestamp: new Date().toISOString(),
      },
      { status: isHealthy ? 200 : 503 }
    );
  } catch {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: 'Internal server error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}