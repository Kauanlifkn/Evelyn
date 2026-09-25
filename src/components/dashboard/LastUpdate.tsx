'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface LastUpdateProps {
  time: string;
}

const FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'America/Sao_Paulo',
};

export function LastUpdate({ time }: LastUpdateProps) {
  // The formatted time is computed only after mount. Rendering a stable
  // placeholder during SSR and the first client render guarantees the
  // server and client HTML match (no hydration mismatch from volatile
  // Date values or locale/timezone differences).
  const [formatted, setFormatted] = useState<string | null>(null);

  useEffect(() => {
    // Deferred to a microtask so no state update runs synchronously inside
    // the effect body (react-hooks/set-state-in-effect).
    queueMicrotask(() => {
      setFormatted(new Date(time).toLocaleString('pt-BR', FORMAT_OPTIONS));
    });
  }, [time]);

  return (
    <div className="flex items-center gap-1.5 text-xs text-hydro-text-secondary">
      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
      <span>Última atualização: {formatted ?? '—'}</span>
    </div>
  );
}
