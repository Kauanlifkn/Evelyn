'use client';

import { ShieldPlus } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface ActiveSheltersCardProps {
  count: number;
  totalCapacity: number;
}

export function ActiveSheltersCard({ count, totalCapacity }: ActiveSheltersCardProps) {
  return (
    <Card>
      {/* Icon */}
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-hydro-safe-soft mb-3">
        <ShieldPlus className="h-5 w-5 text-hydro-safe" />
      </div>

      {/* Value */}
      <p className="text-2xl font-bold text-hydro-text">{count}</p>
      <p className="text-sm text-hydro-text-secondary mb-2">
        Abrigos ativos
      </p>

      {/* Capacity info */}
      <p className="text-xs text-hydro-text-secondary">
        Capacidade total: {totalCapacity.toLocaleString('pt-BR')} — Dados simulados
      </p>
    </Card>
  );
}
