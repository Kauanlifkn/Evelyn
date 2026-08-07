'use client';

import { useState, useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { AlertCard } from '@/components/alerts/AlertCard';
import { AlertFilters } from '@/components/alerts/AlertFilters';
import { SearchInput } from '@/components/ui/SearchInput';
import { mockAlerts } from '@/data/mocks/alerts';
import type { Alert } from '@/types/alert';

export default function AlertasPage() {
  const [selectedSeverity, setSelectedSeverity] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filteredAlerts = useMemo(() => {
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

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-hydro-text">
            Central de Alertas
          </h1>
          <p className="text-sm text-hydro-text-secondary">
            {mockAlerts.length} alertas registrados — todos simulados
          </p>
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
          placeholder="Buscar por título, local ou cidade..."
          aria-label="Buscar alertas"
        />

        {filteredAlerts.length === 0 ? (
          <div className="rounded-2xl border border-hydro-border bg-hydro-surface p-8 text-center">
            <p className="text-hydro-text-secondary">Nenhum alerta encontrado com os filtros atuais.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAlerts.map((alert: Alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
