'use client';

import { AppShell } from '@/components/layout/AppShell';
import { ShelterList } from '@/components/shelters/ShelterList';
import { mockShelters } from '@/data/mocks/shelters';

export default function AbrigosPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-hydro-text">Abrigos</h1>
          <p className="text-sm text-hydro-text-secondary">
            {mockShelters.length} abrigos registrados — dados simulados
          </p>
        </div>

        <ShelterList shelters={mockShelters} />
      </div>
    </AppShell>
  );
}
