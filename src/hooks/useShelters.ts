'use client';

import { useQuery } from '@tanstack/react-query';
import type {
  Shelter,
  ShelterStatus,
} from '@/server/domain/shelters/shelter.contract';

/**
 * Shelters hook (RECOVERY-2) — TanStack Query against /api/v1/shelters.
 * Data is served by ShelterService over the in-memory repository and is
 * SIMULATED in this phase (isSimulated: true everywhere).
 */

export interface SheltersQueryParams {
  status?: ShelterStatus;
  search?: string;
  accessible?: boolean;
  acceptsAnimals?: boolean;
}

async function fetchShelters(params: SheltersQueryParams): Promise<{
  data: Shelter[];
  meta: { total: number };
}> {
  const search = new URLSearchParams();
  if (params.status) search.set('status', params.status);
  if (params.search) search.set('search', params.search);
  if (params.accessible !== undefined)
    search.set('accessible', String(params.accessible));
  if (params.acceptsAnimals !== undefined)
    search.set('acceptsAnimals', String(params.acceptsAnimals));
  search.set('pageSize', '100');

  const res = await fetch(`/api/v1/shelters?${search.toString()}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export function useShelters(params: SheltersQueryParams = {}) {
  const query = useQuery({
    queryKey: ['v1', 'shelters', params],
    queryFn: () => fetchShelters(params),
    staleTime: 60_000,
  });

  return {
    shelters: query.data?.data ?? [],
    total: query.data?.meta.total ?? 0,
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: () => void query.refetch(),
  };
}

export type { Shelter };
