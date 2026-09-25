'use client';

import { Button } from '@/components/ui/Button';

interface MapFiltersProps {
  activeFilters: string[];
  onToggleFilter: (filter: string) => void;
}

const eventTypeOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'flood', label: 'Inundação' },
  { value: 'waterlogging', label: 'Alagamento' },
  { value: 'river_flood', label: 'Enchente' },
  { value: 'heavy_rain', label: 'Chuva intensa' },
  { value: 'landslide', label: 'Deslizamento' },
  { value: 'tsunami', label: 'Tsunami' },
  { value: 'shelter', label: 'Abrigos' },
];

const originOptions = [
  { value: 'all', label: 'Todas as origens' },
  { value: 'inmet', label: 'INMET' },
  { value: 'sensor', label: 'Sensores' },
  { value: 'community', label: 'Comunidade' },
  { value: 'simulated', label: 'Simulados' },
];

export function MapFilters({
  activeFilters,
  onToggleFilter,
}: MapFiltersProps) {
  // Contract (src/lib/map-filters.ts): empty array = all layers visible.
  const isAllActive = activeFilters.length === 0;

  return (
    <div className="flex flex-wrap gap-2">
      {eventTypeOptions.map(({ value, label }) => {
        const isActive =
          value === 'all'
            ? isAllActive
            : activeFilters.includes(value);
        return (
          <Button
            key={value}
            variant={isActive ? 'primary' : 'secondary'}
            size="sm"
            aria-pressed={isActive}
            onClick={() => onToggleFilter(value)}
          >
            {label}
          </Button>
        );
      })}
    </div>
  );
}

export function OriginFilter({
  activeOrigin = 'all',
  onOriginChange,
}: {
  activeOrigin?: string;
  onOriginChange?: (origin: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {originOptions.map(({ value, label }) => (
        <Button
          key={value}
          variant={activeOrigin === value ? 'primary' : 'secondary'}
          size="sm"
          aria-pressed={activeOrigin === value}
          onClick={() => onOriginChange?.(value)}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}
