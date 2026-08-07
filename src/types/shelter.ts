export type ShelterStatus = 'open' | 'crowded' | 'closed' | 'unknown';

export interface Shelter {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  distance: number;
  capacity: number;
  occupied: number;
  availableSpots: number;
  accessible: boolean;
  acceptsAnimals: boolean;
  hasFood: boolean;
  hasMedical: boolean;
  contact: string;
  status: ShelterStatus;
  lastUpdate: string;
  isSimulated: true;
}
