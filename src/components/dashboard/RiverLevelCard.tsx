'use client';

import { Droplets, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface RiverLevelCardProps {
  name: string;
  level: number;
  maxLevel: number;
  warningLevel: number;
  status: string;
  lastUpdate: string;
}

const statusConfig: Record<
  string,
  { color: string; bgColor: string; label: string; severity: number }
> = {
  normal: { color: 'bg-hydro-safe', bgColor: 'bg-hydro-safe', label: 'Normal', severity: 1 },
  warning: { color: 'bg-hydro-warning', bgColor: 'bg-hydro-warning', label: 'Atenção', severity: 2 },
  danger: { color: 'bg-hydro-orange', bgColor: 'bg-hydro-orange', label: 'Perigo', severity: 3 },
  overflow: { color: 'bg-hydro-danger', bgColor: 'bg-hydro-danger', label: 'Transbordamento', severity: 4 },
};

export function RiverLevelCard({
  name,
  level,
  maxLevel,
  warningLevel,
  status,
  lastUpdate,
}: RiverLevelCardProps) {
  const config = statusConfig[status] ?? statusConfig.normal;
  const percentage = Math.min((level / maxLevel) * 100, 100);
  const warningPercentage = (warningLevel / maxLevel) * 100;

  return (
    <Card>
      {/* Icon + Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-hydro-blue-soft">
          <Droplets className="h-5 w-5 text-hydro-blue-600" />
        </div>
        <Badge severity={config.severity}>{config.label}</Badge>
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-hydro-text truncate mb-1">{name}</h3>

      {/* Value */}
      <div className="mb-3">
        <span className="text-2xl font-bold text-hydro-text">{level}m</span>
        <span className="text-sm text-hydro-text-secondary ml-1">/ {maxLevel}m</span>
      </div>

      {/* Progress bar */}
      <div className="relative h-3 bg-hydro-surface-blue rounded-full overflow-hidden mb-3">
        {/* Warning threshold marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-hydro-warning z-10"
          style={{ left: `${warningPercentage}%` }}
          title={`Nível de atenção: ${warningLevel}m`}
        />
        {/* Current level fill */}
        <div
          className={cn('h-full rounded-full transition-all', config.color)}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-hydro-text-secondary">
          Atualizado: {new Date(lastUpdate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </p>
        {(status === 'danger' || status === 'overflow') && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-hydro-danger">
            <TrendingUp className="h-3 w-3" />
            Subindo
          </span>
        )}
      </div>
    </Card>
  );
}
