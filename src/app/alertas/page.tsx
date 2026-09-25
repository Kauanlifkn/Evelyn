'use client';

import { useState, useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { AlertCard } from '@/components/alerts/AlertCard';
import { OfficialAlertCard } from '@/components/alerts/OfficialAlertCard';
import { AlertFilters } from '@/components/alerts/AlertFilters';
import { SearchInput } from '@/components/ui/SearchInput';
import { SourceStatus } from '@/components/alerts/SourceStatus';
import { useOfficialAlerts } from '@/hooks/useOfficialAlerts';
import { mockAlerts } from '@/data/mocks/alerts';
import type { Alert } from '@/types/alert';
import type { OfficialAlert } from '@/server/providers/alerts/types';

export default function AlertasPage() {
  const [selectedSeverity, setSelectedSeverity] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const { alerts: officialAlerts, meta, loading, error } = useOfficialAlerts();

  // Filter mock alerts (used when no official data)
  const filteredMockAlerts = useMemo(() => {
    return mockAlerts.filter((alert: Alert) => {
      if (selectedSeverity !== null && alert.severity !== selectedSeverity) return false;
      if (selectedType !== null && alert.type !== selectedType) return false;
      if (search) {
        const q = search.toLowerCase();
        const matchesTitle = alert.title.toLowerCase().includes(q);
        const matchesLocation = alert.location.toLowerCase().includes(q);
        const matchesCity = alert.city.toLowerCase().includes(q);
        if (!matchesTitle && !matchesLocation && !matchesCity) return false;
      }
      return true;
    });
  }, [selectedSeverity, selectedType, search]);

  // Filter official alerts
  const filteredOfficialAlerts = useMemo(() => {
    return officialAlerts.filter((alert: OfficialAlert) => {
      if (alert.status !== 'active') return false;
      if (selectedSeverity !== null) {
        const severityMap: Record<string, number> = {
          informative: 0, attention: 1, danger: 2, extreme: 3,
        };
        if (severityMap[alert.severity] !== selectedSeverity) return false;
      }
      if (selectedType !== null && alert.eventType !== selectedType) return false;
      if (search) {
        const q = search.toLowerCase();
        const matchesTitle = alert.title.toLowerCase().includes(q);
        const matchesDesc = alert.description.toLowerCase().includes(q);
        const matchesAreas = alert.areas.some((a) =>
          a.areaDesc.toLowerCase().includes(q)
        );
        if (!matchesTitle && !matchesDesc && !matchesAreas) return false;
      }
      return true;
    });
  }, [officialAlerts, selectedSeverity, selectedType, search]);

  // Use official alerts when available, fall back to mock
  const hasOfficial = meta?.isOfficial && meta.sourceStatus !== 'OFFLINE';
  const displayAlerts = hasOfficial ? filteredOfficialAlerts : filteredMockAlerts;

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-hydro-text">
            Central de Alertas
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-1">
            <p className="text-sm text-hydro-text-secondary">
              {loading
                ? 'Carregando alertas...'
                : error
                  ? `Erro: ${error}`
                  : hasOfficial
                    ? `${meta!.count} alertas oficiais ativos — ${meta!.source}`
                    : `${mockAlerts.length} alertas registrados — dados simulados`}
            </p>
            {hasOfficial && <SourceStatus />}
          </div>
        </div>

        <AlertFilters
          selectedSeverity={selectedSeverity}
          selectedType={selectedType}
          onSeverityChange={setSelectedSeverity}
          onTypeChange={setSelectedType}
        />

        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar por título, área ou evento..."
          aria-label="Buscar alertas"
        />

        {loading ? (
          <div className="rounded-2xl border border-hydro-border bg-hydro-surface p-8 text-center">
            <p className="text-hydro-text-secondary">Carregando alertas...</p>
          </div>
        ) : displayAlerts.length === 0 ? (
          <div className="rounded-2xl border border-hydro-border bg-hydro-surface p-8 text-center">
            <p className="text-hydro-text-secondary">
              {error
                ? 'Não foi possível consultar a fonte oficial neste momento.'
                : 'Nenhum alerta encontrado com os filtros atuais.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {hasOfficial
              ? filteredOfficialAlerts.map((alert) => (
                  <OfficialAlertCard key={alert.id} alert={alert} />
                ))
              : filteredMockAlerts.map((alert) => (
                  <AlertCard key={alert.id} alert={alert} />
                ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}