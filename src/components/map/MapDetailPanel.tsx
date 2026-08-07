'use client';

import { X, MapPin, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { getAlertTypeLabel, getSeverityLabel } from '@/lib/utils';
import type { MapMarker } from '@/types/map';

interface MapDetailPanelProps {
  item: MapMarker | null;
  onClose: () => void;
}

export function MapDetailPanel({ item, onClose }: MapDetailPanelProps) {
  if (!item) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-hydro-text-secondary">
        <p>Selecione um ponto no mapa para ver detalhes</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {item.type === 'alert' && (
            <AlertTriangle className="h-4 w-4 text-hydro-orange" />
          )}
          {item.type === 'shelter' && (
            <ShieldCheck className="h-4 w-4 text-hydro-safe" />
          )}
          {item.type === 'risk_area' && (
            <AlertTriangle className="h-4 w-4 text-hydro-danger" />
          )}
          <h3 className="text-sm font-semibold text-hydro-text">{item.label}</h3>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-hydro-text-secondary hover:bg-hydro-surface-blue hover:text-hydro-text transition-colors"
          aria-label="Fechar painel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Type badge */}
      <div className="flex flex-wrap gap-2">
        <Badge severity={item.severity ?? 0}>
          {item.type === 'alert'
            ? getAlertTypeLabel(item.label.split('-')[0]?.trim() || '')
            : item.type === 'shelter'
            ? 'Abrigo'
            : item.type === 'risk_area'
            ? 'Área de Risco'
            : item.type}
        </Badge>
        {item.severity !== undefined && (
          <span className="text-xs text-hydro-text-secondary">
            Severidade: {getSeverityLabel(item.severity)}
          </span>
        )}
      </div>

      {/* Coordinates */}
      <div className="text-xs text-hydro-text-secondary">
        <span className="flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
        </span>
      </div>

      <p className="text-xs text-hydro-text-secondary italic">
        Dados simulados
      </p>
    </div>
  );
}
