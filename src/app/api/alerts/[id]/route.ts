/**
 * GET /api/alerts/[id]
 *
 * Returns a single alert by ID from the configured provider.
 */

import { NextResponse } from 'next/server';
import { getAlertProvider } from '@/server/providers/alerts';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const provider = getAlertProvider();
    const alerts = await provider.fetchActiveAlerts();
    const alert = alerts.find((a) => a.id === id);

    if (!alert) {
      return NextResponse.json(
        { error: 'Alert not found', id },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: alert });
  } catch (error) {
    console.error('[/api/alerts/[id]] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
