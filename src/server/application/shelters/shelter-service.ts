/**
 * Shelter application service (RECOVERY-2).
 * Frontend → API → ShelterService → Repository (in-memory today,
 * PostgreSQL/PostGIS in RECOVERY-3).
 */

import type {
  Shelter,
  ShelterFilter,
} from '@/server/domain/shelters/shelter.contract';
import { AppError } from '@/server/shared/errors/app-error';
import {
  DEFAULT_PAGE_SIZE,
  type PageMeta,
  type PaginationQuery,
} from '@/server/shared/pagination';

export interface ShelterRepositoryPort {
  list(filter?: ShelterFilter): Promise<Shelter[]>;
  getById(id: string): Promise<Shelter | null>;
}

export interface ShelterListResult {
  items: Shelter[];
  meta: PageMeta;
}

export class ShelterService {
  constructor(private readonly repository: ShelterRepositoryPort) {}

  async list(
    filter: ShelterFilter = {},
    pagination: PaginationQuery = { page: 1, pageSize: DEFAULT_PAGE_SIZE }
  ): Promise<ShelterListResult> {
    const all = await this.repository.list(filter);
    const total = all.length;
    const start = (pagination.page - 1) * pagination.pageSize;
    return {
      items: all.slice(start, start + pagination.pageSize),
      meta: {
        page: pagination.page,
        pageSize: pagination.pageSize,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / pagination.pageSize),
      },
    };
  }

  async getById(id: string): Promise<Shelter> {
    const shelter = await this.repository.getById(id);
    if (!shelter) {
      throw AppError.notFound('Abrigo não encontrado.', { shelterId: id });
    }
    return shelter;
  }
}
