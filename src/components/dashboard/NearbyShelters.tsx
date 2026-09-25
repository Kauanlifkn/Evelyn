'use client';

import Link from 'next/link';
import { ShieldPlus, MapPin, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import {
  cn,
  formatDistance,
  getShelterStatusLabel,
  getShelterStatusColor,
} from '@/lib/utils';
import type { Shelter } from '@/server/domain/shelters/shelter.contract';

interface NearbySheltersProps {
  shelters: Shelter[];
}

export function NearbyShelters({ shelters }: NearbySheltersProps) {
  const nearby = shelters.slice(0, 3);

  if (nearby.length === 0) {
    return (
      <Card>
        <p className="text-sm text-hydro-text-secondary text-center py-4">
          Nenhum abrigo próximo encontrado. Dados simulados.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {nearby.map((shelter) => {
        const statusColor = getShelterStatusColor(shelter.status);
        return (
          <Link key={shelter.id} href="/abrigos">
            <Card className="mb-2 group">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-hydro-safe-soft shrink-0">
                  <ShieldPlus className="h-4 w-4 text-hydro-safe" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="text-sm font-semibold text-hydro-text truncate">
                      {shelter.name}
                    </h4>
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold',
                        statusColor.bg,
                        statusColor.text
                      )}
                    >
                      {getShelterStatusLabel(shelter.status)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-hydro-text-secondary">
                    {shelter.distanceKm !== undefined && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" aria-hidden="true" />
                        {formatDistance(shelter.distanceKm)}
                      </span>
                    )}
                    <span>{shelter.estimatedVacancies} vagas</span>
                    <span>Capacidade: {shelter.capacity}</span>
                  </div>
                </div>
                <ChevronRight
                  className="h-4 w-4 text-hydro-text-muted shrink-0 mt-1 group-hover:text-hydro-blue-500 transition-colors"
                  aria-hidden="true"
                />
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
