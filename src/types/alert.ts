export type Severity = 0 | 1 | 2 | 3 | 4;

export type AlertOrigin =
  | 'OFFICIAL'
  | 'SENSOR'
  | 'MODEL'
  | 'OPERATOR'
  | 'COMMUNITY'
  | 'PARTNER';

export type AlertStatus =
  | 'draft'
  | 'validating'
  | 'active'
  | 'updated'
  | 'closed'
  | 'cancelled'
  | 'false_positive';

export type AlertType =
  | 'flood'
  | 'waterlogging'
  | 'river_flood'
  | 'flash_flood'
  | 'landslide'
  | 'dam_risk'
  | 'heavy_rain'
  | 'coastal_surge'
  | 'tsunami'
  | 'storm_surge'
  | 'high_waves';

export interface Alert {
  id: string;
  title: string;
  description: string;
  type: AlertType;
  severity: Severity;
  origin: AlertOrigin;
  status: AlertStatus;
  location: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  instructions: string[];
  startedAt: string;
  validUntil: string;
  source: string;
  affectedAreas: string[];
  isSimulated: true;
}
