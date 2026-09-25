'use client';

import { useEffect, useState } from 'react';
import type { SourceHealth } from '@/server/providers/alerts/types';

interface SourceStatusProps {
  className?: string;
}

export function SourceStatus({ className = '' }: SourceStatusProps) {
  const [health, setHealth] = useState<SourceHealth | null>(null);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch('/api/sources/status');
        if (res.ok) {
          const data = await res.json();
          const source = data.sources?.[0];
          if (source) setHealth(source);
        }
      } catch {
        // Silent fail - status display is non-critical
      }
    }

    fetchStatus();
    const interval = setInterval(fetchStatus, 60_000);
    return () => clearInterval(interval);
  }, []);

  if (!health) return null;

  const statusColor =
    health.status === 'ONLINE'
      ? 'bg-hydro-safe'
      : health.status === 'STALE'
      ? 'bg-hydro-warning'
      : 'bg-hydro-danger';

  const statusLabel =
    health.status === 'ONLINE'
      ? 'Online'
      : health.status === 'STALE'
      ? 'Atualizando...'
      : 'Fonte temporariamente indisponível';

  const timeLabel =
    health.status === 'ONLINE'
      ? 'Última sincronização'
      : 'Última leitura válida';

  const timeValue =
    health.status === 'ONLINE'
      ? health.lastSuccessAt
      : health.lastSuccessAt || health.lastAttemptAt;

  const formattedTime = timeValue
    ? new Date(timeValue).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : '--:--:--';

  const detailParts = [
    `Status: ${statusLabel}`,
    `Latência: ${health.latencyMs != null ? `${health.latencyMs} ms` : '—'}`,
    `Última tentativa: ${
      health.lastAttemptAt
        ? new Date(health.lastAttemptAt).toLocaleTimeString('pt-BR')
        : '—'
    }`,
    health.message ? `Mensagem: ${health.message}` : null,
  ].filter(Boolean);
  const detail = detailParts.join(' · ');

  return (
    <div
      className={`flex flex-wrap items-center gap-3 text-xs text-hydro-text-secondary ${className}`}
      role="status"
      aria-label={`Status da fonte ${health.source}: ${statusLabel}`}
      title={detail}
    >
      <span className="font-medium text-hydro-text">{health.source}</span>
      <span className={`h-2 w-2 rounded-full ${statusColor} shrink-0`} />
      <span>{statusLabel}</span>
      {health.latencyMs != null && <span>{health.latencyMs} ms</span>}
      {timeValue && (
        <>
          <span className="text-hydro-border" aria-hidden="true">|</span>
          <span>
            {timeLabel}: {formattedTime}
          </span>
        </>
      )}
    </div>
  );
}
