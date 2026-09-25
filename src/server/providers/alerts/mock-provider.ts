/**
 * Mock Alert Provider
 *
 * Wraps existing mock data to implement the AlertProvider interface.
 * Used when ALERT_DATA_MODE=mock.
 */

import type {
  OfficialAlert,
  AlertProvider,
  SourceHealth,
} from './types';
import { mockAlerts } from '@/data/mocks/alerts';

class MockProvider implements AlertProvider {
  async fetchActiveAlerts(): Promise<OfficialAlert[]> {
    // Convert mock alerts to OfficialAlert format for API compatibility.
    // HONESTY RULE (HIDRO-ALERTA.md §1/§2): simulated data must never be
    // labeled as official — isOfficial stays false so the OFICIAL badge
    // cannot render for demo data.
    return mockAlerts
      .filter((a) => a.status === 'active')
      .map((a) => ({
        id: a.id,
        source: 'MOCK',
        sourceType: 'DEMO',
        externalId: a.id,
        title: a.title,
        description: a.description,
        eventType: a.type,
        severity: 'attention' as const,
        originalSeverity: `mock-${a.severity}`,
        status: 'active' as const,
        issuedAt: a.startedAt,
        effectiveAt: a.startedAt,
        expiresAt: a.validUntil,
        areas: a.affectedAreas.map((area) => ({ areaDesc: area })),
        isOfficial: false,
        isSimulated: true,
        sourceUrl: '',
        fetchedAt: new Date().toISOString(),
      }));
  }

  getSourceHealth(): SourceHealth {
    return {
      source: 'MOCK',
      status: 'ONLINE',
      lastAttemptAt: new Date().toISOString(),
      lastSuccessAt: new Date().toISOString(),
      latencyMs: 0,
      errorCode: null,
      message: null,
    };
  }
}

let instance: MockProvider | null = null;

export function getMockProvider(): MockProvider {
  if (!instance) {
    instance = new MockProvider();
  }
  return instance;
}

export { MockProvider };
