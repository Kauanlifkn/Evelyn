import type { User, City } from '@/types/user';

export const mockUser: User = {
  id: 'user-001',
  name: 'Carlos Eduardo Silva',
  email: 'carlos.silva@hidroalerta.gov.br',
  role: 'admin',
  avatarUrl: null,
  city: 'São Paulo',
  state: 'SP',
  isSimulated: true,
};

export const mockCities: City[] = [
  {
    id: 'city-001',
    name: 'São Paulo',
    state: 'SP',
    latitude: -23.5505,
    longitude: -46.6333,
    population: 12325232,
    isSimulated: true,
  },
  {
    id: 'city-002',
    name: 'Rio de Janeiro',
    state: 'RJ',
    latitude: -22.9068,
    longitude: -43.1729,
    population: 6748000,
    isSimulated: true,
  },
  {
    id: 'city-003',
    name: 'Recife',
    state: 'PE',
    latitude: -8.0476,
    longitude: -34.8770,
    population: 1653461,
    isSimulated: true,
  },
  {
    id: 'city-004',
    name: 'Belém',
    state: 'PA',
    latitude: -1.4558,
    longitude: -48.5024,
    population: 1533808,
    isSimulated: true,
  },
  {
    id: 'city-005',
    name: 'Porto Alegre',
    state: 'RS',
    latitude: -30.0346,
    longitude: -51.2177,
    population: 1488252,
    isSimulated: true,
  },
  {
    id: 'city-006',
    name: 'Manaus',
    state: 'AM',
    latitude: -3.1190,
    longitude: -60.0217,
    population: 2220980,
    isSimulated: true,
  },
];
