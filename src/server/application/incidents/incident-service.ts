/**
 * Incident application service (RECOVERY-2).
 *
 * Phase rules (doc-aligned honesty):
 * - Creates receive a TEMPORARY id in the in-memory repository (demo).
 * - Consent is mandatory (validated at the schema AND asserted here).
 * - Storage is process memory only — never presented as durable.
 */

import type {
  CreateIncidentInput,
  Incident,
  IncidentFilter,
} from '@/server/domain/incidents/incident.contract';
import { AppError } from '@/server/shared/errors/app-error';
import {
  DEFAULT_PAGE_SIZE,
  type PageMeta,
  type PaginationQuery,
} from '@/server/shared/pagination';

export interface IncidentRepositoryPort {
  create(input: CreateIncidentInput): Promise<Incident>;
  list(filter?: IncidentFilter): Promise<Incident[]>;
  getById(id: string): Promise<Incident | null>;
  /** Empties the store (in-memory implementations; used by tests/ops). */
  clear(): Promise<void>;
}

export interface IncidentListResult {
  items: Incident[];
  meta: PageMeta;
}

export class IncidentService {
  constructor(private readonly repository: IncidentRepositoryPort) {}

  async create(input: CreateIncidentInput): Promise<Incident> {
    if (input.consent !== true) {
      // Defense in depth: the Zod schema already enforces literal true.
      throw AppError.validation(
        'Consentimento obrigatório para registrar a ocorrência.'
      );
    }
    return this.repository.create(input);
  }

  async list(
    filter: IncidentFilter = {},
    pagination: PaginationQuery = { page: 1, pageSize: DEFAULT_PAGE_SIZE }
  ): Promise<IncidentListResult> {
    const all = await this.repository.list(filter);
    // Newest first — reports are time-critical.
    const sorted = [...all].sort((a, b) =>
      b.reportedAt.localeCompare(a.reportedAt)
    );
    const total = sorted.length;
    const start = (pagination.page - 1) * pagination.pageSize;
    return {
      items: sorted.slice(start, start + pagination.pageSize),
      meta: {
        page: pagination.page,
        pageSize: pagination.pageSize,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / pagination.pageSize),
      },
    };
  }

  async getById(id: string): Promise<Incident> {
    const incident = await this.repository.getById(id);
    if (!incident) {
      throw AppError.notFound('Ocorrência não encontrada.', { incidentId: id });
    }
    return incident;
  }
}
