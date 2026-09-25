'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { AppShell } from '@/components/layout/AppShell';
import { MapFilters } from '@/components/map/MapFilters';
import { MapLegend } from '@/components/map/MapLegend';
import { MapSummary } from '@/components/map/MapSummary';
import { toggleMapFilter } from '@/lib/map-filters';
import { mockAlerts } from '@/data/mocks/alerts';
import { mockShelters } from '@/data/mocks/shelters';
import { mockRiskAreas } from '@/data/mocks/risk-areas';

const RiskMap = dynamic(
  () => import('@/components/map/RiskMap'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[500px] items-center justify-center rounded-2xl bg-hydro-surface-blue text-hydro-text-secondary">
        Carregando mapa...
      </div>
    ),
  }
);

export default function MapaPage() {
  // Contract (src/lib/map-filters.ts): [] = all layers visible.
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  function handleToggleFilter(filter: string) {
    setActiveFilters((prev) => toggleMapFilter(prev, filter));
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-hydro-text">Mapa de Risco</h1>
          <p className="text-sm text-hydro-text-secondary">
            Visualize alertas, abrigos e áreas de risco — dados simulados
          </p>
        </div>

        <MapFilters
          activeFilters={activeFilters}
          onToggleFilter={handleToggleFilter}
        />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <div className="h-[500px] overflow-hidden rounded-2xl border border-hydro-border shadow-hydro-sm">
              <RiskMap
                alerts={mockAlerts}
                shelters={mockShelters}
                riskAreas={mockRiskAreas}
                filters={activeFilters}
              />
            </div>
            <p className="mt-1 text-xs text-hydro-text-secondary">
              Mapa © OpenStreetMap contributors. Dados simulados para demonstração.
            </p>
          </div>
          <div className="space-y-4">
            <MapLegend />
          </div>
        </div>

        {/* Textual alternative — required for accessibility (§6.3/§15) */}
        <MapSummary
          alerts={mockAlerts}
          shelters={mockShelters}
          riskAreas={mockRiskAreas}
          filters={activeFilters}
        />
      </div>
    </AppShell>
  );
}
