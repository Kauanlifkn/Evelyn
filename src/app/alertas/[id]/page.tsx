'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { AlertDetail } from '@/components/alerts/AlertDetail';
import { OfficialAlertDetail } from '@/components/alerts/OfficialAlertDetail';
import { Button } from '@/components/ui/Button';
import { useOfficialAlert } from '@/hooks/useOfficialAlerts';
import { mockAlerts } from '@/data/mocks/alerts';
import { ArrowLeft } from 'lucide-react';

export default function AlertaDetalhePage() {
  const params = useParams();
  const alertId = params.id as string;

  const { alert: officialAlert, loading: officialLoading, error: officialError } = useOfficialAlert(alertId);
  const mockAlert = mockAlerts.find((a) => a.id === alertId);

  // Show loading
  if (officialLoading) {
    return (
      <AppShell>
        <div className="space-y-6">
          <Link href="/alertas" className="inline-flex items-center gap-1 text-sm text-hydro-blue-600 hover:text-hydro-blue-700">
            <ArrowLeft className="h-4 w-4" />
            Voltar para alertas
          </Link>
          <div className="rounded-2xl border border-hydro-border bg-hydro-surface p-8 text-center">
            <p className="text-hydro-text-secondary">Carregando...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <Link href="/alertas" className="inline-flex items-center gap-1 text-sm text-hydro-blue-600 hover:text-hydro-blue-700">
          <ArrowLeft className="h-4 w-4" />
          Voltar para alertas
        </Link>

        {/* Official alert takes priority */}
        {officialAlert ? (
          <OfficialAlertDetail alert={officialAlert} />
        ) : mockAlert ? (
          <AlertDetail alert={mockAlert} />
        ) : (
          <div className="rounded-2xl border border-hydro-border bg-hydro-surface p-8 text-center">
            <p className="text-lg font-medium text-hydro-text">Alerta não encontrado</p>
            <p className="mt-1 text-sm text-hydro-text-secondary">
              {officialError
                ? 'Não foi possível consultar a fonte oficial neste momento.'
                : 'O alerta solicitado não existe ou foi removido.'}
            </p>
            <Link href="/alertas" className="mt-4 inline-block">
              <Button variant="outline">Ver todos os alertas</Button>
            </Link>
          </div>
        )}
      </div>
    </AppShell>
  );
}