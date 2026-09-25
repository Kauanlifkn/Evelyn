'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SearchInput } from '@/components/ui/SearchInput';
import { cn } from '@/lib/utils';
import { mockAlerts } from '@/data/mocks/alerts';
import { mockShelters } from '@/data/mocks/shelters';

interface SearchResult {
  href: string;
  label: string;
  group: string;
}

const PAGE_RESULTS: SearchResult[] = [
  { href: '/', label: 'Dashboard', group: 'Páginas' },
  { href: '/mapa', label: 'Mapa de risco', group: 'Páginas' },
  { href: '/alertas', label: 'Central de alertas', group: 'Páginas' },
  { href: '/abrigos', label: 'Abrigos', group: 'Páginas' },
  { href: '/ocorrencias', label: 'Relatar ocorrência', group: 'Páginas' },
  { href: '/tsunami', label: 'Riscos costeiros e tsunami', group: 'Páginas' },
];

const MAX_RESULTS = 8;

/**
 * Functional, keyboard-navigable search over the destinations that exist
 * in the current frontend: static pages, alerts and shelters (simulated
 * data, labeled). Replaces the previous input that had no effect.
 */
export function SidebarSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const results = useMemo<SearchResult[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const pageHits = PAGE_RESULTS.filter((p) =>
      p.label.toLowerCase().includes(q)
    );
    const alertHits = mockAlerts
      .filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.city.toLowerCase().includes(q)
      )
      .slice(0, 4)
      .map(
        (a): SearchResult => ({
          href: `/alertas/${a.id}`,
          label: a.title,
          group: 'Alertas (simulados)',
        })
      );
    const shelterHits = mockShelters
      .filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.city.toLowerCase().includes(q)
      )
      .slice(0, 3)
      .map(
        (s): SearchResult => ({
          href: '/abrigos',
          label: s.name,
          group: 'Abrigos (simulados)',
        })
      );

    return [...pageHits, ...alertHits, ...shelterHits].slice(0, MAX_RESULTS);
  }, [query]);

  // Close on outside click / Escape handled here; focus stays in input.
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function goTo(result: SearchResult) {
    setOpen(false);
    setQuery('');
    router.push(result.href);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (!open || results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = results[activeIndex] ?? results[0];
      if (target) goTo(target);
    }
  }

  const listboxId = 'sidebar-search-results';

  return (
    <div ref={containerRef} className="relative px-3 py-3" onKeyDown={handleKeyDown}>
      <SearchInput
        value={query}
        onChange={(value) => {
          setQuery(value);
          setOpen(true);
          setActiveIndex(0);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Buscar alertas, abrigos..."
        variant="dark"
        aria-label="Buscar no menu"
        aria-expanded={open}
        aria-controls={listboxId}
        role="combobox"
        aria-autocomplete="list"
      />

      {open && (
        <div
          id={listboxId}
          role="listbox"
          aria-label="Resultados da busca"
          className="absolute left-3 right-3 top-full mt-1 z-50 rounded-xl border border-hydro-navy-700 bg-hydro-navy-900 shadow-hydro-lg py-1.5 max-h-72 overflow-y-auto"
        >
          {results.length === 0 ? (
            <p className="px-3 py-2 text-sm text-hydro-text-muted">
              Nenhum resultado para “{query.trim()}”.
            </p>
          ) : (
            results.map((result, i) => (
              <button
                key={`${result.group}-${result.label}`}
                type="button"
                role="option"
                aria-selected={i === activeIndex}
                className={cn(
                  'block w-full text-left px-3 py-2 text-sm transition-colors',
                  i === activeIndex
                    ? 'bg-hydro-blue-600 text-white'
                    : 'text-hydro-text-muted hover:bg-white/10 hover:text-hydro-text-on-dark'
                )}
                onMouseEnter={() => setActiveIndex(i)}
                // mousedown so the click lands before any blur/close
                onMouseDown={(e) => {
                  e.preventDefault();
                  goTo(result);
                }}
              >
                <span className="block text-[10px] uppercase tracking-wide opacity-70">
                  {result.group}
                </span>
                <span className="block truncate">{result.label}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
