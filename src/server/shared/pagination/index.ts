/**
 * Pagination contract (RECOVERY-2).
 *
 * Query: ?page=1&pageSize=20 (both optional, 1-based).
 * Hard caps keep public GET endpoints cheap.
 */

import { z } from 'zod';
import { AppError } from '../errors/app-error';

export const MIN_PAGE = 1;
export const MIN_PAGE_SIZE = 1;
export const MAX_PAGE_SIZE = 100;
export const DEFAULT_PAGE_SIZE = 20;

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(MIN_PAGE).default(1),
  pageSize: z.coerce.number().int().min(MIN_PAGE).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export interface PageMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export function buildPageMeta(total: number, query: PaginationQuery): PageMeta {
  const totalPages = total === 0 ? 0 : Math.ceil(total / query.pageSize);
  return {
    page: query.page,
    pageSize: query.pageSize,
    total,
    totalPages,
  };
}

export function paginate<T>(items: T[], query: PaginationQuery): T[] {
  const start = (query.page - 1) * query.pageSize;
  return items.slice(start, start + query.pageSize);
}

/**
 * Parse pagination from a raw URLSearchParams, throwing the standard
 * VALIDATION_ERROR AppError on invalid values.
 */
export function parsePagination(searchParams: URLSearchParams): PaginationQuery {
  const raw = {
    page: searchParams.get('page') ?? undefined,
    pageSize: searchParams.get('pageSize') ?? undefined,
  };
  const parsed = paginationQuerySchema.safeParse(raw);
  if (!parsed.success) {
    throw AppError.validation('Parâmetros de paginação inválidos.', {
      issues: parsed.error.issues.map((i) => ({ path: i.path, message: i.message })),
    });
  }
  return parsed.data;
}
