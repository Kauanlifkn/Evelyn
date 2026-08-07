'use client';

import { Clock } from 'lucide-react';

interface LastUpdateProps {
  time: string;
}

export function LastUpdate({ time }: LastUpdateProps) {
  const formatted = new Date(time).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="flex items-center gap-1.5 text-xs text-hydro-text-secondary">
      <Clock className="h-3.5 w-3.5" />
      <span>Última atualização: {formatted}</span>
    </div>
  );
}
