'use client';

import { cn } from '@/lib/utils';

const legendItems = [
  { label: 'Informativo', color: 'bg-hydro-blue-500' },
  { label: 'Atenção', color: 'bg-hydro-warning' },
  { label: 'Perigo', color: 'bg-hydro-orange' },
  { label: 'Perigo Extremo', color: 'bg-hydro-danger' },
  { label: 'Emergência', color: 'bg-hydro-purple' },
  { label: 'Abrigo', color: 'bg-hydro-safe' },
];

export function MapLegend() {
  return (
    <div className="flex flex-wrap gap-3">
      {legendItems.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <div
            className={cn('h-3 w-3 rounded-sm', item.color)}
          />
          <span className="text-xs text-hydro-text-secondary">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
