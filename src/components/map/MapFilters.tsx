'use client';

import { Button } from '@/components/ui/Button';

interface MapFiltersProps {
  activeFilters: string[];
  onToggleFilter: (filter: string) => void;
}

const filterOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'flood', label: 'Inundação' },
  { value: 'waterlogging', label: 'Alagamento' },
  { value: 'river_flood', label: 'Enchente' },
  { value: 'heavy_rain', label: 'Chuva intensa' },
  { value: 'landslide', label: 'Deslizamento' },
  { value: 'tsunami', label: 'Tsunami' },
  { value: 'shelter', label: 'Abrigos' },
];

export function MapFilters({
  activeFilters,
  onToggleFilter,
}: MapFiltersProps) {
  const isAllActive = activeFilters.length === 0;

  const handleToggle = (filter: string) => {
    if (filter === 'all') {
      if (!isAllActive) {
        activeFilters.forEach((f) => onToggleFilter(f));
      }
    } else {
      onToggleFilter(filter);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {filterOptions.map(({ value, label }) => {
        const isActive =
          value === 'all'
            ? isAllActive
            : activeFilters.includes(value);
        return (
          <Button
            key={value}
            variant={isActive ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => handleToggle(value)}
          >
            {label}
          </Button>
        );
      })}
    </div>
  );
}
