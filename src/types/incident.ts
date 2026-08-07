export type IncidentType =
  | 'waterlogging'
  | 'flood'
  | 'landslide'
  | 'blocked_road'
  | 'person_at_risk';

export interface Incident {
  id: string;
  type: IncidentType;
  description: string;
  location: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  waterDepth: number | null;
  blockedRoad: boolean;
  peopleAtRisk: number;
  photoUrl: string | null;
  anonymous: boolean;
  createdAt: string;
  status: 'pending' | 'validating' | 'confirmed' | 'rejected';
  isSimulated: true;
}
