'use client';

import { Button } from '@/components/ui/Button';

interface AlertFiltersProps {
  selectedSeverity: number | null;
  selectedType: string | null;
  onSeverityChange: (s: number | null) => void;
  onTypeChange: (t: string | null) => void;
}

const severityOptions = [
  { value: null, label: 'Todos' },
  { value: 0, label: 'Informativo' },
  { value: 1, label: 'Atenção' },
  { value: 2, label: 'Perigo' },
  { value: 3, label: 'Perigo Extremo' },
  { value: 4, label: 'Emergência' },
];

const typeOptions = [
  { value: null, label: 'Todos' },
  { value: 'flood', label: 'Inundação' },
  { value: 'waterlogging', label: 'Alagamento' },
  { value: 'river_flood', label: 'Enchente' },
  { value: 'flash_flood', label: 'Enchente Rápida' },
  { value: 'landslide', label: 'Deslizamento' },
  { value: 'heavy_rain', label: 'Chuva intensa' },
  { value: 'dam_risk', label: 'Risco de Barragem' },
  { value: 'storm_surge', label: 'Mare de Tempestade' },
  { value: 'high_waves', label: 'Ondas Altas' },
  { value: 'tsunami', label: 'Tsunami' },
  { value: 'coastal_surge', label: 'Resaca Costeira' },
];

export function AlertFilters({
  selectedSeverity,
  selectedType,
  onSeverityChange,
  onTypeChange,
}: AlertFiltersProps) {
  return (
    <div className="space-y-3">
      {/* Severity buttons */}
      <div>
        <p className="text-xs font-medium text-hydro-text-secondary uppercase tracking-wide mb-2">
          Severidade
        </p>
        <div className="flex flex-wrap gap-2">
          {severityOptions.map(({ value, label }) => (
            <Button
              key={label}
              variant={selectedSeverity === value ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => onSeverityChange(value)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Type dropdown */}
      <div>
        <label
          htmlFor="alert-type-filter"
          className="text-xs font-medium text-hydro-text-secondary uppercase tracking-wide mb-2 block"
        >
          Tipo
        </label>
        <select
          id="alert-type-filter"
          value={selectedType ?? ''}
          onChange={(e) =>
            onTypeChange(e.target.value ? e.target.value : null)
          }
          className="w-full rounded-xl border border-hydro-border bg-hydro-surface py-2 px-3 text-sm text-hydro-text focus:border-hydro-blue-600 focus:outline-none focus:ring-2 focus:ring-hydro-blue-600/20"
        >
          {typeOptions.map(({ value, label }) => (
            <option key={value ?? 'all'} value={value ?? ''}>
              {label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
