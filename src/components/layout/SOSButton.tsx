'use client';

import { Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SOSButton() {
  const handleClick = () => {
    // Real action: dial 192. In a desktop browser this opens the OS call
    // handler; on mobile it starts the call. A confirmation prevents
    // accidental triggers.
    const confirmed = window.confirm(
      'SOS — Ligar para a Central de Emergência (192)?'
    );
    if (confirmed) {
      window.location.href = 'tel:192';
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'hidden lg:flex',
        'fixed right-6 z-20 bottom-8',
        'w-14 h-14 rounded-full bg-hydro-gradient-emergency',
        'text-white shadow-hydro-sos',
        'items-center justify-center',
        'hover:scale-105 active:scale-95 transition-transform',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hydro-danger'
      )}
      aria-label="SOS - Emergência"
      title="SOS - Emergência"
    >
      <Phone className="h-6 w-6" />
    </button>
  );
}
