'use client';

import { useQuery } from '@tanstack/react-query';
import type {
  Alert,
  AlertSeverity,
} from '@/server/domain/alerts/alert.contract';
import type { SourceHealth } from '@/server/domain/sources/sources.contract';

/**
 * Alerts hooks (RECOVERY-2) — TanStack Query against /api/v1.
 * Frontend → API → AlertService → AlertSourcePort (INMET | mock).
 */

export interface AlertsPageMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  source: string;
  isOfficial: boolean;
  sourceStatus: 'ONLINE' | 'STALE' | 'OFFLINE';
  dataMode: string;
}

export interface UseAlertsResult {
  alerts: Alert[];
  meta: AlertsPageMeta | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

async function fetchAlertsJson(): Promise<{
  data: Alert[];
  meta: AlertsPageMeta;
}> {
  const res = await fetch('/api/v1/alerts?pageSize=100');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export function useOfficialAlerts(): UseAlertsResult {
  const query = useQuery({
    queryKey: ['v1', 'alerts'],
    queryFn: fetchAlertsJson,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

  return {
    alerts: query.data?.data ?? [],
    meta: query.data?.meta ?? null,
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: () => void query.refetch(),
  };
}

export function useOfficialAlert(id: string | null) {
  const query = useQuery({
    queryKey: ['v1', 'alerts', id],
    queryFn: async (): Promise<Alert> => {
      const res = await fetch(`/api/v1/alerts/${id}`);
      if (res.status === 404) {
        throw new Error('Alerta não encontrado');
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return json.data as Alert;
    },
    enabled: Boolean(id),
    staleTime: 60_000,
    retry: (failureCount, error) =>
      // 404 is a definitive answer — never retry it.
      !(error instanceof Error && error.message === 'Alerta não encontrado') &&
      failureCount < 1,
  });

  return {
    alert: query.data ?? null,
    loading: query.isLoading,
    error:
      query.error instanceof Error
        ? query.error.message
        : query.isError
          ? 'Erro ao buscar alerta'
          : null,
  };
}

async function fetchSourcesStatus(): Promise<{ data: SourceHealth[] }> {
  const res = await fetch('/api/v1/sources/status');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export function useSourcesStatus() {
  const query = useQuery({
    queryKey: ['v1', 'sources', 'status'],
    queryFn: fetchSourcesStatus,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  return {
    health: query.data?.data?.[0] ?? null,
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
  };
}

export type { AlertSeverity };
