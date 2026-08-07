export interface River {
  id: string;
  name: string;
  city: string;
  state: string;
  currentLevel: number;
  maxLevel: number;
  warningLevel: number;
  status: 'normal' | 'warning' | 'danger' | 'overflow';
  lastUpdate: string;
  isSimulated: true;
}

export const mockRivers: River[] = [
  {
    id: 'river-001',
    name: 'Rio Tietê',
    city: 'São Paulo',
    state: 'SP',
    currentLevel: 7.8,
    maxLevel: 10.0,
    warningLevel: 7.0,
    status: 'danger',
    lastUpdate: '2026-08-06T09:45:00-03:00',
    isSimulated: true,
  },
  {
    id: 'river-002',
    name: 'Rio Capibaribe',
    city: 'Recife',
    state: 'PE',
    currentLevel: 4.2,
    maxLevel: 6.5,
    warningLevel: 5.0,
    status: 'warning',
    lastUpdate: '2026-08-06T08:30:00-03:00',
    isSimulated: true,
  },
  {
    id: 'river-003',
    name: 'Rio Madeira',
    city: 'Porto Velho',
    state: 'RO',
    currentLevel: 15.2,
    maxLevel: 17.0,
    warningLevel: 13.0,
    status: 'overflow',
    lastUpdate: '2026-08-06T06:00:00-04:00',
    isSimulated: true,
  },
  {
    id: 'river-004',
    name: 'Rio Jacuí',
    city: 'Porto Alegre',
    state: 'RS',
    currentLevel: 3.1,
    maxLevel: 8.0,
    warningLevel: 5.5,
    status: 'normal',
    lastUpdate: '2026-08-06T07:15:00-03:00',
    isSimulated: true,
  },
  {
    id: 'river-005',
    name: 'Rio Negro',
    city: 'Manaus',
    state: 'AM',
    currentLevel: 28.5,
    maxLevel: 30.0,
    warningLevel: 27.0,
    status: 'warning',
    lastUpdate: '2026-08-06T05:00:00-04:00',
    isSimulated: true,
  },
];
