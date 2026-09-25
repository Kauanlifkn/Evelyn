'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { OfficialAlertCard } from '@/components/alerts/OfficialAlertCard';
import { AlertFilters } from '@/components/alerts/AlertFilters';
import { SearchInput } from '@/components/ui/SearchInput';
import { SourceStatus } from '@/components/alerts/SourceStatus';
import { Card } from '@/components/ui/Card';
import { useOfficialAlerts } from '@/hooks/useOfficialAlerts';

/**
 * Central de Alertas (RECOVERY-2): single data path through the API
 * (/api/v1/alerts → AlertService → INMET|mock). Official alerts show the
 * OFICIAL badge; simulated ones never do. Severity is the official 0–4
 * scale; eventType filters accept INMET and simulated event slugs.
 */
export default function AlertasPage() {
  const [selectedSeverity, setSelectedSeverity] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const { alerts, meta, loading, error, refetch } = useOfficialAlerts();

  const isMockMode = meta?.dataMode === 'mock';
  const hasOfficial = meta?.isOfficial && meta.sourceStatus !== 'OFFLINE';

  const filtered = alerts.filter((alert) => {
    if (alert.status === 'closed') return false;
    if (selectedSeverity !== null && alert.severity !== selectedSeverity)
      return false;
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
                    ? `${meta?.total ?? 0} alertas oficiais ativos — ${meta?.source}`
                    : isMockMode
                      ? `${filtered.length} alertas registrados — dados simulados`
                      : 'Fonte oficial temporariamente indisponível'}
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
          <Card>
            <p className="text-hydro-text-secondary text-center py-8">
              Carregando alertas...
            </p>
          </Card>
        ) : error && !isMockMode ? (
          <Card>
            <div className="text-center py-8 space-y-3">
              <p className="text-sm text-hydro-text">
                Não foi possível consultar a fonte oficial neste momento —{' '}
                <strong>isso não significa ausência de risco</strong>. Em
                emergência, ligue 192 / 193 / 199.
              </p>
              <button
                onClick={refetch}
                className="inline-flex items-center justify-center rounded-lg bg-hydro-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-hydro-blue-800 transition-colors"
              >
                Tentar novamente
              </button>
            </div>
          </Card>
        ) : filtered.length === 0 ? (
          <Card>
            <p className="text-hydro-text-secondary text-center py-8">
              {error
                ? 'Não foi possível consultar os alertas neste momento.'
                : 'Nenhum alerta encontrado com os filtros atuais.'}
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((alert) => (
              <OfficialAlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
