'use client';

import { AppShell } from '@/components/layout/AppShell';
import { ShelterList } from '@/components/shelters/ShelterList';
import { Card } from '@/components/ui/Card';
import { useShelters } from '@/hooks/useShelters';

/**
 * Abrigos (RECOVERY-2): the page consumes the API
 * (frontend → /api/v1/shelters → ShelterService → in-memory repository)
 * instead of importing mocks. Data remains simulated (isSimulated: true).
 */
export default function AbrigosPage() {
  const { shelters, total, loading, error, refetch } = useShelters();

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-hydro-text">Abrigos</h1>
          <p className="text-sm text-hydro-text-secondary">
            {loading ? 'Carregando abrigos...' : `${total} abrigos registrados — dados simulados`}
          </p>
        </div>

        {loading ? (
          <Card>
            <p className="text-sm text-hydro-text-secondary text-center py-8">
              Carregando abrigos...
            </p>
          </Card>
        ) : error ? (
          <Card>
            <div className="text-center py-8 space-y-3">
              <p className="text-sm text-hydro-text">
                Não foi possível carregar os abrigos neste momento ({error}).
              </p>
              <button
                onClick={refetch}
                className="inline-flex items-center justify-center rounded-lg bg-hydro-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-hydro-blue-800 transition-colors"
              >
                Tentar novamente
              </button>
            </div>
          </Card>
        ) : (
          <ShelterList shelters={shelters} />
        )}
      </div>
    </AppShell>
  );
}
