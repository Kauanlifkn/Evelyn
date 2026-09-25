'use client';

import { useCallback, useEffect, useState } from 'react';
import type { OfficialAlert } from '@/server/providers/alerts/types';

interface AlertsResponse {
  data: OfficialAlert[];
  meta: {
    source: string;
    isOfficial: boolean;
    fetchedAt: string | null;
    count: number;
    totalCount: number;
    sourceStatus: string;
    dataMode: string;
    error?: string;
  };
}

interface UseOfficialAlertsReturn {
  alerts: OfficialAlert[];
  meta: AlertsResponse['meta'] | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// Module-level in-flight/result cache per alert id. Prevents duplicate
// requests when React Strict Mode runs effects twice in development and on
// remounts; failed lookups are evicted so a later visit can retry.
const detailCache = new Map<
  string,
  Promise<{ alert: OfficialAlert | null; error: string | null }>
>();

function fetchAlertDetail(
  id: string
): Promise<{ alert: OfficialAlert | null; error: string | null }> {
  let entry = detailCache.get(id);
  if (!entry) {
    entry = (async () => {
      try {
        const res = await fetch(`/api/alerts/${id}`);
        if (res.status === 404) {
          return { alert: null, error: 'Alerta não encontrado' };
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        return { alert: json.data as OfficialAlert, error: null };
      } catch (err) {
        return {
          alert: null,
          error:
            err instanceof Error ? err.message : 'Erro ao buscar alerta',
        };
      }
    })();
    detailCache.set(id, entry);
    void entry.then((result) => {
      if (result.error) detailCache.delete(id);
    });
  }
  return entry;
}

export function useOfficialAlerts(): UseOfficialAlertsReturn {
  const [alerts, setAlerts] = useState<OfficialAlert[]>([]);
  const [meta, setMeta] = useState<AlertsResponse['meta'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // All state updates happen strictly after the first await so that no
  // setState runs synchronously inside the effect body
  // (react-hooks/set-state-in-effect).
  const loadAlerts = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch('/api/alerts', { signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json: AlertsResponse = await res.json();
      setAlerts(json.data);
      setMeta(json.meta);
      setError(null);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setError(
        err instanceof Error ? err.message : 'Erro ao buscar alertas'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    // Deferred to a microtask so no state update runs synchronously inside
    // the effect body (react-hooks/set-state-in-effect).
    queueMicrotask(() => void loadAlerts(controller.signal));

    // Refresh every 2 minutes
    const interval = setInterval(() => void loadAlerts(), 120_000);
    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [loadAlerts]);

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    void loadAlerts();
  }, [loadAlerts]);

  return { alerts, meta, loading, error, refetch };
}

export function useOfficialAlert(id: string | null) {
  const [alert, setAlert] = useState<OfficialAlert | null>(null);
  // If the detail is already cached (Strict Mode double-mount, back-forward
  // navigation) we can render immediately without a loading flash.
  const [loading, setLoading] = useState(() =>
    id ? !detailCache.has(id) : false
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let active = true;
    void fetchAlertDetail(id).then((result) => {
      if (!active) return;
      setAlert(result.alert);
      setError(result.error);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [id]);

  return { alert, loading, error };
}
