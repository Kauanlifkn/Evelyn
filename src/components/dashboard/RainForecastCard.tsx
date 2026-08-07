'use client';

import { CloudRain, Thermometer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/Card';

interface RainForecastCardProps {
  date: string;
  rainProbability: number;
  rainVolume: number;
  temperatureMin: number;
  temperatureMax: number;
}

export function RainForecastCard({
  date,
  rainProbability,
  rainVolume,
  temperatureMin,
  temperatureMax,
}: RainForecastCardProps) {
  const formattedDate = new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  const probabilityColor =
    rainProbability >= 70
      ? 'text-hydro-blue-600'
      : rainProbability >= 40
      ? 'text-hydro-warning'
      : 'text-hydro-text-secondary';

  return (
    <Card>
      {/* Icon + Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-hydro-cyan-500/10">
          <CloudRain className="h-5 w-5 text-hydro-cyan-500" />
        </div>
        <h3 className="text-sm font-semibold text-hydro-text capitalize">
          {formattedDate}
        </h3>
      </div>

      {/* Rain probability — big number */}
      <div className="mb-3">
        <span className={cn('text-3xl font-bold', probabilityColor)}>
          {rainProbability}%
        </span>
        <span className="text-sm text-hydro-text-secondary ml-2">chuva</span>
      </div>

      {/* Details */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-hydro-text-secondary">Volume</span>
          <span className="text-sm font-semibold text-hydro-text">
            {rainVolume} mm
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Thermometer className="h-3.5 w-3.5 text-hydro-text-secondary" />
            <span className="text-xs text-hydro-text-secondary">Temperatura</span>
          </div>
          <span className="text-sm font-semibold text-hydro-text">
            {temperatureMin}° / {temperatureMax}°C
          </span>
        </div>
      </div>
    </Card>
  );
}
