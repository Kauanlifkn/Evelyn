/**
 * In-memory Shelter repository (RECOVERY-2 — transitional until PostGIS).
 *
 * Seeds deterministically from the simulated dataset. Swap target for
 * RECOVERY-3: same interface against PostgreSQL/PostGIS.
 */

import { mockShelters } from '@/data/mocks/shelters';
import type {
  Shelter,
  ShelterFilter,
} from '@/server/domain/shelters/shelter.contract';
import { nowIso } from '@/server/shared/time';

export interface ShelterRepository {
  list(filter?: ShelterFilter): Promise<Shelter[]>;
  getById(id: string): Promise<Shelter | null>;
}

function toDomain(legacy: (typeof mockShelters)[number]): Shelter {
  return {
    id: legacy.id,
    name: legacy.name,
    address: legacy.address,
    latitude: legacy.latitude,
    longitude: legacy.longitude,
    distanceKm: legacy.distance,
    capacity: legacy.capacity,
    estimatedVacancies: legacy.availableSpots,
    status: legacy.status,
    accessibility: legacy.accessible,
    acceptsAnimals: legacy.acceptsAnimals,
    foodAvailable: legacy.hasFood,
    medicalSupport: legacy.hasMedical,
    phone: legacy.contact.length > 0 ? legacy.contact : null,
    lastUpdatedAt: legacy.lastUpdate,
    source: 'MOCK',
    isSimulated: true,
    createdAt: legacy.lastUpdate,
    updatedAt: nowIso(),
  };
}

export class InMemoryShelterRepository implements ShelterRepository {
  private readonly shelters: Shelter[];

  constructor(seed: Shelter[] | null = null) {
    this.shelters = seed ?? mockShelters.map(toDomain);
  }

  async list(filter: ShelterFilter = {}): Promise<Shelter[]> {
    const q = filter.search?.toLowerCase();
    return this.shelters.filter((s) => {
      if (filter.status && s.status !== filter.status) return false;
      if (filter.city && !s.address.toLowerCase().includes(filter.city.toLowerCase()))
        return false;
      if (filter.search) {
        const hay = `${s.name} ${s.address}`.toLowerCase();
        if (!hay.includes(q ?? '')) return false;
      }
      if (
        filter.accessible !== undefined &&
        s.accessibility !== (filter.accessible === 'true')
      )
        return false;
      if (
        filter.acceptsAnimals !== undefined &&
        s.acceptsAnimals !== (filter.acceptsAnimals === 'true')
      )
        return false;
      return true;
    });
  }

  async getById(id: string): Promise<Shelter | null> {
    return this.shelters.find((s) => s.id === id) ?? null;
  }
}
