'use client';

import { Users } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface RiskPeopleCardProps {
  count: number;
  city: string;
}

export function RiskPeopleCard({ count, city }: RiskPeopleCardProps) {
  return (
    <Card>
      {/* Icon */}
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-hydro-purple-soft mb-3">
        <Users className="h-5 w-5 text-hydro-purple" />
      </div>

      {/* Value */}
      <p className="text-2xl font-bold text-hydro-text">
        {count.toLocaleString('pt-BR')}
      </p>
      <p className="text-sm text-hydro-text-secondary mb-2">
        Pessoas em risco
      </p>

      {/* Footer */}
      <p className="text-xs text-hydro-text-secondary">
        {city} — Dados simulados
      </p>
    </Card>
  );
}
