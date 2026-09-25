/**
 * Shared legacy wire-format mapping (RECOVERY-2).
 * Used by the legacy /api/alerts routes to keep their historical JSON
 * shape while delegating internally to the domain services.
 */

export const SEVERITY_TO_LEGACY: Record<number, string> = {
  0: 'informative',
  1: 'attention',
  2: 'danger',
  3: 'extreme',
  // Level 4 (Emergência) is never produced automatically; if it ever
  // appears from an approved official source, the closest legacy label is
  // 'extreme'. Kept explicit to avoid silent index math.
  4: 'extreme',
};

export function legacySeverity(severity: number): string {
  return SEVERITY_TO_LEGACY[severity] ?? 'informative';
}

export function legacyStatus(status: string): 'active' | 'expired' {
  return status === 'closed' ? 'expired' : 'active';
}
