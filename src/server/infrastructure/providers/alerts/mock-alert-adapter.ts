/**
 * Mock → domain Alert adapter (RECOVERY-2).
 *
 * Serves the simulated dataset through the SAME domain contract so the v1
 * API behaves identically in demo mode. Honesty invariants:
 *   - isSimulated: true, isOfficial: false
 *   - source: "MOCK", sourceType: "DEMO"
 */

import { mockAlerts } from '@/data/mocks/alerts';
import type {
  Alert,
  AlertStatus,
} from '@/server/domain/alerts/alert.contract';
import type { AlertSourcePort } from '@/server/domain/alerts/alert.contract';
import { nowIso } from '@/server/shared/time';

export function toDomainAlertFromMock(legacy: (typeof mockAlerts)[number]): Alert {
  const iso = nowIso();
  const status: AlertStatus = legacy.status;
  return {
    id: legacy.id,
    externalId: legacy.id,
    source: 'MOCK',
    sourceType: 'DEMO',
    origin: legacy.origin,
    eventType: legacy.type,
    severity: legacy.severity,
    originalSeverity: `mock-${legacy.severity}`,
    status,
    title: legacy.title,
    description: legacy.description,
    instruction: legacy.instructions.length > 0
      ? legacy.instructions.join(' ')
      : undefined,
    issuedAt: legacy.startedAt,
    effectiveAt: legacy.startedAt,
    expiresAt: legacy.validUntil,
    areas: legacy.affectedAreas.map((area) => ({ areaDesc: area })),
    isOfficial: false,
    isSimulated: true,
    sourceUrl: '',
    fetchedAt: iso,
    createdAt: legacy.startedAt,
    updatedAt: iso,
  };
}

export class MockAlertSource implements AlertSourcePort {
  readonly id = 'MOCK';

  async fetchAlerts(): Promise<Alert[]> {
    // The full simulated dataset (including non-active states) is served;
    // filtering (status/active/severity/…) is the API layer's job.
    return mockAlerts.map(toDomainAlertFromMock);
  }
}
