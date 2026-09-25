'use client';

import { ShieldCheck } from 'lucide-react';

interface OfficialBadgeProps {
  source: string;
  size?: 'sm' | 'md';
}

export function OfficialBadge({ source, size = 'sm' }: OfficialBadgeProps) {
  const isOfficial = source === 'INMET';

  if (!isOfficial) return null;

  const sizeClasses = size === 'sm'
    ? 'text-[10px] px-1.5 py-0.5'
    : 'text-xs px-2 py-0.5';

  return (
    <span className="flex items-center gap-1">
      <span
        className={`inline-flex items-center gap-1 rounded-md bg-hydro-safe-soft text-hydro-safe-dark font-bold uppercase tracking-wider ${sizeClasses}`}
      >
        <ShieldCheck className="h-3 w-3" />
        OFICIAL
      </span>
      <span
        className={`inline-flex items-center rounded-md bg-hydro-blue-soft text-hydro-blue-700 font-bold uppercase tracking-wider ${sizeClasses}`}
      >
        {source}
      </span>
    </span>
  );
}
