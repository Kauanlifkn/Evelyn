export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'operator' | 'citizen';
  avatarUrl: string | null;
  city: string;
  state: string;
  isSimulated: true;
}

export interface City {
  id: string;
  name: string;
  state: string;
  latitude: number;
  longitude: number;
  population: number;
  isSimulated: true;
}
