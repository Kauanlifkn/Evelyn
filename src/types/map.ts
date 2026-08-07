import type { AlertType } from './alert';

export type MapFilterType = AlertType | 'shelter' | 'hospital';

export interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  type: 'alert' | 'shelter' | 'hospital' | 'risk_area';
  label: string;
  severity?: number;
  color?: string;
}

export interface RiskArea {
  id: string;
  name: string;
  type: AlertType;
  level: number;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  isSimulated: true;
}
