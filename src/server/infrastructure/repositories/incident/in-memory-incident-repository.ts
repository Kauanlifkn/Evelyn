/**
 * In-memory Incident repository (RECOVERY-2 — transitional).
 *
 * Privacy: stores ONLY the validated domain fields. No IP, no User-Agent,
 * no GPS, no hidden storage — the process memory IS the storage in this
 * phase and it is labeled as demo everywhere (isSimulated = true).
 */

import type {
  CreateIncidentInput,
  Incident,
  IncidentFilter,
} from '@/server/domain/incidents/incident.contract';
import { nowIso } from '@/server/shared/time';

export interface IncidentRepository {
  create(input: CreateIncidentInput): Promise<Incident>;
  list(filter?: IncidentFilter): Promise<Incident[]>;
  getById(id: string): Promise<Incident | null>;
  /** Test/ops helper — clears the in-memory store. */
  clear(): void;
}

let sequence = 0;

export class InMemoryIncidentRepository implements IncidentRepository {
  private readonly incidents: Incident[] = [];

  async create(input: CreateIncidentInput): Promise<Incident> {
    sequence += 1;
    const iso = nowIso();
    const incident: Incident = {
      id: `inc-demo-${String(sequence).padStart(6, '0')}`,
      type: input.type,
      description: input.description,
      location: input.location,
      waterDepth: input.waterDepth ?? null,
      roadBlocked: input.roadBlocked,
      peopleAtRisk: input.peopleAtRisk,
      anonymous: input.anonymous,
      consent: input.consent,
      reportedAt: iso,
      status: 'pending',
      source: 'DEMO_APP',
      isSimulated: true,
      createdAt: iso,
      updatedAt: iso,
    };
    this.incidents.push(incident);
    return incident;
  }

  async list(filter: IncidentFilter = {}): Promise<Incident[]> {
    return this.incidents.filter((i) => {
      if (filter.status && i.status !== filter.status) return false;
      if (filter.type && i.type !== filter.type) return false;
      return true;
    });
  }

  async getById(id: string): Promise<Incident | null> {
    return this.incidents.find((i) => i.id === id) ?? null;
  }

  async clear(): Promise<void> {
    this.incidents.length = 0;
    sequence = 0;
  }
}
