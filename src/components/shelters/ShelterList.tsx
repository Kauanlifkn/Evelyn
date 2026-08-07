'use client';

import { useState, useMemo } from 'react';
import { SearchInput } from '@/components/ui/SearchInput';
import { Button } from '@/components/ui/Button';
import { ShelterCard } from '@/components/shelters/ShelterCard';
import type { Shelter } from '@/types/shelter';

interface ShelterListProps {
  shelters: Shelter[];
}

const statusFilters = [
  { value: 'all', label: 'Todos' },
  { value: 'open', label: 'Abertos' },
  { value: 'crowded', label: 'Lotados' },
  { value: 'closed', label: 'Fechados' },
];

export function ShelterList({ shelters }: ShelterListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = useMemo(() => {
    return shelters.filter((s) => {
      const matchesSearch =
        search === '' ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.city.toLowerCase().includes(search.toLowerCase());
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
        placeholder="Buscar por nome ou cidade..."
        aria-label="Buscar abrigos"
      />

      {/* Status filter */}
      <div className="flex flex-wrap gap-2">
        {statusFilters.map(({ value, label }) => (
          <Button
            key={value}
            variant={statusFilter === value ? 'primary' : 'secondary'}
            size="sm"
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
