/**
 * Official Alert types for real data sources (INMET, future IDAP, etc.)
 */

export type OfficialSeverity =
  | 'informative'
  | 'attention'
  | 'danger'
  | 'extreme';

export type OfficialAlertStatus = 'active' | 'expired';

export interface AlertArea {
  areaDesc: string;
  polygon?: string;
  circle?: string;
  geocode?: string;
}

export interface OfficialAlert {
  id: string;
  source: 'INMET' | string;
  sourceType: 'OFFICIAL_WEATHER' | string;

  externalId: string;

  title: string;
  description: string;
  // INMET does not provide instructions
  instruction?: string;

  eventType: string;

  severity: OfficialSeverity;
  originalSeverity: string;

  status: OfficialAlertStatus;

  issuedAt?: string;
  effectiveAt?: string;
  expiresAt?: string;

  sender?: string;
  senderName?: string;

  areas: AlertArea[];

  // Honesty contract: only real provider data may set isOfficial=true.
  // The mock provider MUST set isOfficial=false / isSimulated=true so no
  // simulated alert can ever render with the "OFICIAL" badge.
  isOfficial: boolean;
  isSimulated: boolean;

  sourceUrl: string;
  fetchedAt: string;
}

export type SourceStatus = 'ONLINE' | 'STALE' | 'OFFLINE';

export interface SourceHealth {
  source: string;
  status: SourceStatus;
  lastAttemptAt: string | null;
  lastSuccessAt: string | null;
  latencyMs: number | null;
  errorCode: string | null;
  message: string | null;
}

export interface AlertProvider {
  fetchActiveAlerts(): Promise<OfficialAlert[]>;
  getSourceHealth(): SourceHealth;
}
