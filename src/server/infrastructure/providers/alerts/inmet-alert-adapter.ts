/**
 * INMET → domain Alert adapter (RECOVERY-2).
 *
 * Wraps the existing (RECOVERY-1, tested) InmetProvider and adapts its
 * legacy OfficialAlert shape into the domain contract:
 *   - severity string (informative/attention/danger/extreme) → 0..3
 *     (numeric 4/Emergência is never produced automatically)
 *   - origin → 'OFFICIAL'
 *   - legacy status 'expired' → domain 'closed'
 *
 * No RSS parsing lives here or in components — parsing stays in the
 * legacy provider, which owns the timeout/retry/cache/health logic.
 */

import type { OfficialAlert } from '@/server/providers/alerts/types';
import type {
  Alert,
  AlertOrigin,
  AlertSeverity,
  AlertStatus,
} from '@/server/domain/alerts/alert.contract';
import type { AlertSourcePort } from '@/server/domain/alerts/alert.contract';
import { nowIso } from '@/server/shared/time';

const SEVERITY_TO_DOMAIN: Record<string, AlertSeverity> = {
  informative: 0,
  attention: 1,
  danger: 2,
  extreme: 3,
};

export function mapOfficialSeverity(severity: string): AlertSeverity {
  return SEVERITY_TO_DOMAIN[severity] ?? 0;
}

export function mapOfficialStatus(status: string): AlertStatus {
  // The legacy provider only emits active|expired (validity window).
  // Domain states follow doc §5; an out-of-window alert is 'closed'.
  return status === 'expired' ? 'closed' : 'active';
}

export function toDomainAlert(
  legacy: OfficialAlert,
  sourceId: string
): Alert {
  const origin: AlertOrigin = 'OFFICIAL';
  const iso = nowIso();
  return {
    id: legacy.id,
    externalId: legacy.externalId,
    source: sourceId,
    sourceType: legacy.sourceType,
    origin,
    eventType: legacy.eventType,
    severity: mapOfficialSeverity(legacy.severity),
    originalSeverity: legacy.originalSeverity,
    status: mapOfficialStatus(legacy.status),
    title: legacy.title,
    description: legacy.description,
    instruction: legacy.instruction,
    issuedAt: legacy.issuedAt,
    effectiveAt: legacy.effectiveAt,
    expiresAt: legacy.expiresAt,
    areas: legacy.areas.map((a) => ({ areaDesc: a.areaDesc })),
    isOfficial: legacy.isOfficial,
    isSimulated: legacy.isSimulated,
    sourceUrl: legacy.sourceUrl,
    fetchedAt: legacy.fetchedAt,
    createdAt: legacy.issuedAt ?? iso,
    updatedAt: iso,
  };
}

export class InmetAlertSource implements AlertSourcePort {
  readonly id = 'INMET';

  constructor(private readonly provider: {
    fetchActiveAlerts(): Promise<OfficialAlert[]>;
  }) {}

  async fetchAlerts(): Promise<Alert[]> {
    const legacy = await this.provider.fetchActiveAlerts();
    return legacy.map((a) => toDomainAlert(a, this.id));
  }
}
