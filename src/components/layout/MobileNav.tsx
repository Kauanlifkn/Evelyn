'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Home, Map, AlertTriangle, ShieldPlus, Menu, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  activePath: string;
}

const tabs = [
  { href: '/', label: 'Início', icon: Home },
  { href: '/mapa', label: 'Mapa', icon: Map },
  { href: '/alertas', label: 'Alertas', icon: AlertTriangle },
  { href: '/abrigos', label: 'Abrigos', icon: ShieldPlus },
];

const moreLinks = [
  { href: '/ocorrencias', label: 'Ocorrências' },
  { href: '/tsunami', label: 'Tsunami' },
];

export function MobileNav({ activePath }: MobileNavProps) {
  const [moreOpen, setMoreOpen] = useState(false);

  const isMoreActive =
    !tabs.some((t) =>
      t.href === '/' ? activePath === '/' : activePath.startsWith(t.href)
    ) && moreLinks.some((l) => activePath.startsWith(l.href));

  const handleSOS = () => {
    alert(
      'Em produção, ligaria para emergência (192). Dados simulados.'
    );
  };

  return (
    <>
      {/* Dropdown menu */}
      {moreOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40"
          onClick={() => setMoreOpen(false)}
        >
          <div className="absolute bottom-20 right-4 bg-hydro-surface border border-hydro-border rounded-2xl shadow-hydro-lg py-2 w-48">
            {moreLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMoreOpen(false)}
                className={cn(
                  'block px-4 py-2.5 text-sm transition-colors rounded-lg mx-1',
                  activePath.startsWith(href)
                    ? 'bg-hydro-surface-blue text-hydro-blue-700 font-medium'
                    : 'text-hydro-text hover:bg-hydro-surface-blue'
                )}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Bottom navigation */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-hydro-gradient-sidebar shadow-[0_-2px_12px_rgba(0,0,0,0.15)]"
        aria-label="Navegação mobile"
      >
        <div className="flex items-end justify-around h-[72px] pb-2 pt-1 px-2">
          {tabs.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === '/' ? activePath === '/' : activePath.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium transition-colors',
                  isActive
                    ? 'text-hydro-cyan-400'
                    : 'text-hydro-text-muted'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className={cn('h-5 w-5', isActive ? 'text-hydro-cyan-400' : '')} />
                {label}
              </Link>
            );
          })}

          {/* SOS Button — center */}
          <button
            onClick={handleSOS}
            className={cn(
              'relative -top-4 flex flex-col items-center justify-center',
              'w-14 h-14 rounded-full bg-hydro-gradient-emergency',
              'text-white shadow-hydro-sos',
              'transition-transform active:scale-95',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hydro-danger'
            )}
            aria-label="SOS - Emergência"
          >
            <Phone className="h-5 w-5" />
            <span className="text-[9px] font-bold mt-0.5">SOS</span>
          </button>

          {/* Spacer for layout balance */}
          <div className="w-3" />

          {/* More button */}
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className={cn(
              'flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium transition-colors',
              isMoreActive
                ? 'text-hydro-cyan-400'
                : 'text-hydro-text-muted'
            )}
            aria-label="Mais opções"
            aria-expanded={moreOpen}
          >
            <Menu className={cn('h-5 w-5', isMoreActive ? 'text-hydro-cyan-400' : '')} />
            Mais
          </button>
        </div>
      </nav>
    </>
  );
}
