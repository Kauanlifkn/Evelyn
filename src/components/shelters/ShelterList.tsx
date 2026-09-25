'use client';

import { useMemo, useState } from 'react';
import { SearchInput } from '@/components/ui/SearchInput';
import { Button } from '@/components/ui/Button';
import { ShelterCard } from '@/components/shelters/ShelterCard';
import type { Shelter } from '@/server/domain/shelters/shelter.contract';

interface ShelterListProps {
  shelters: Shelter[];
}

const statusFilters = [
  { value: 'all', label: 'Todos' },
  { value: 'open', label: 'Abertos' },
  { value: 'crowded', label: 'Lotados' },
  { value: 'closed', label: 'Fechados' },
  { value: 'unknown', label: 'Desconhecido' },
] as const;

/**
 * Client-side search/filter over the shelters already fetched from the
 * API (RECOVERY-2: the page no longer imports mocks — it consumes
 * /api/v1/shelters via useShelters).
 */
export function ShelterList({ shelters }: ShelterListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return shelters.filter((s) => {
      const matchesSearch =
        q === '' || `${s.name} ${s.address}`.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === 'all' || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [shelters, search, statusFilter]);

  return (
    <div className="space-y-4">
      {/* Search */}
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar por nome ou endereço..."
        aria-label="Buscar abrigos"
      />

      {/* Status filter */}
      <div className="flex flex-wrap gap-2">
        {statusFilters.map(({ value, label }) => (
          <Button
            key={value}
            variant={statusFilter === value ? 'primary' : 'secondary'}
            size="sm"
            aria-pressed={statusFilter === value}
            onClick={() => setStatusFilter(value)}
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Results */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <p className="text-sm text-hydro-text-secondary text-center py-8">
            Nenhum abrigo encontrado. Dados simulados.
          </p>
        ) : (
          filtered.map((shelter) => (
            <ShelterCard key={shelter.id} shelter={shelter} />
          ))
        )}
      </div>

      <p className="text-xs text-hydro-text-secondary text-center">
        {filtered.length} abrigo(s) encontrado(s) - Dados simulados
      </p>
    </div>
  );
}
