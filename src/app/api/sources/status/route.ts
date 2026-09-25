/**
 * GET /api/sources/status
 *
 * Returns health status of all configured alert sources.
 */

import { NextResponse } from 'next/server';
import { getAlertProvider, getAlertDataMode } from '@/server/providers/alerts';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const provider = getAlertProvider();
    const health = provider.getSourceHealth();

    return NextResponse.json({
      sources: [health],
      dataMode: getAlertDataMode(),
    });
  } catch (error) {
    console.error('[/api/sources/status] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}