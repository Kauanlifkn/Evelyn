'use client';

import {
  MapPin,
  Phone,
  Users,
  Accessibility,
  PawPrint,
  Stethoscope,
  Navigation,
  Utensils,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  cn,
  formatDate,
  formatDistance,
  getShelterStatusLabel,
  getShelterStatusColor,
  telHref,
} from '@/lib/utils';
import type { Shelter } from '@/server/domain/shelters/shelter.contract';

interface ShelterCardProps {
  shelter: Shelter;
}

/**
 * Shelter card for the domain contract (RECOVERY-2):
 * estimatedVacancies / accessibility / foodAvailable / medicalSupport /
 * phone / distanceKm? / lastUpdatedAt. Data is simulated (isSimulated).
 */
export function ShelterCard({ shelter }: ShelterCardProps) {
  const statusColor = getShelterStatusColor(shelter.status);
  const occupied = Math.max(0, shelter.capacity - shelter.estimatedVacancies);
  const occupancyPercent = shelter.capacity
    ? Math.round((occupied / shelter.capacity) * 100)
    : 0;
  const phoneHref = shelter.phone ? telHref(shelter.phone) : null;

  return (
    <Card>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-hydro-text truncate">
              {shelter.name}
            </h3>
            <p className="text-xs text-hydro-text-secondary truncate flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3" aria-hidden="true" />
              {shelter.address}
            </p>
          </div>
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold shrink-0',
              statusColor.bg,
              statusColor.text
            )}
          >
            {getShelterStatusLabel(shelter.status)}
          </span>
        </div>

        {/* Info row */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-hydro-text-secondary">
          {shelter.distanceKm !== undefined && (
            <span className="flex items-center gap-1">
              <Navigation className="h-3 w-3" aria-hidden="true" />
              {formatDistance(shelter.distanceKm)}
            </span>
          )}
          {shelter.phone ? (
            phoneHref ? (
              <a
                href={phoneHref}
                className="flex items-center gap-1 font-medium text-hydro-blue-700 hover:text-hydro-blue-600 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hydro-cyan-500 rounded"
                aria-label={`Ligar para ${shelter.name}: ${shelter.phone}`}
              >
                <Phone className="h-3 w-3" aria-hidden="true" />
                {shelter.phone}
              </a>
            ) : (
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" aria-hidden="true" />
                {shelter.phone}
              </span>
            )
          ) : (
            <span className="italic">Sem telefone informado</span>
          )}
        </div>

        {/* Capacity bar */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-hydro-text-secondary">
              <Users className="h-3 w-3 inline mr-1" aria-hidden="true" />
              Ocupação
            </span>
            <span className="font-medium text-hydro-text">
              {occupied}/{shelter.capacity} ({occupancyPercent}%)
            </span>
          </div>
          <div className="h-2.5 bg-hydro-surface-blue rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                occupancyPercent >= 90
                  ? 'bg-hydro-danger'
                  : occupancyPercent >= 70
                    ? 'bg-hydro-warning'
                    : 'bg-hydro-safe'
              )}
              style={{ width: `${occupancyPercent}%` }}
            />
          </div>
          <p className="text-xs text-hydro-text-secondary mt-1">
            {shelter.estimatedVacancies} vagas disponíveis
          </p>
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-2">
          {shelter.accessibility && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-hydro-surface-blue px-2.5 py-1 text-[10px] text-hydro-text-secondary">
              <Accessibility className="h-3 w-3" aria-hidden="true" />
              Acessível
            </span>
          )}
          {shelter.acceptsAnimals && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-hydro-surface-blue px-2.5 py-1 text-[10px] text-hydro-text-secondary">
              <PawPrint className="h-3 w-3" aria-hidden="true" />
              Animais
            </span>
          )}
          {shelter.foodAvailable && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-hydro-surface-blue px-2.5 py-1 text-[10px] text-hydro-text-secondary">
              <Utensils className="h-3 w-3" aria-hidden="true" />
              Alimentação
            </span>
          )}
          {shelter.medicalSupport && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-hydro-surface-blue px-2.5 py-1 text-[10px] text-hydro-text-secondary">
              <Stethoscope className="h-3 w-3" aria-hidden="true" />
              Médico
            </span>
          )}
        </div>

        {/* Last update */}
        <p className="text-[11px] text-hydro-text-secondary">
          Última atualização: {formatDate(shelter.lastUpdatedAt)} — dado simulado
        </p>

        {/* Action buttons */}
        <div className="flex gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => alert('Simulado: Abrir mapa com localização do abrigo.')}
            className="flex-1"
          >
            Ver no mapa
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => alert('Simulado: Abrir rota no navegador.')}
            className="flex-1"
          >
            <Navigation className="h-3.5 w-3.5" aria-hidden="true" />
            Traçar rota
          </Button>
        </div>
      </div>
    </Card>
  );
}
