'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { OfficialAlertDetail } from '@/components/alerts/OfficialAlertDetail';
import { Button } from '@/components/ui/Button';
import { useOfficialAlert } from '@/hooks/useOfficialAlerts';
import { ArrowLeft } from 'lucide-react';

/**
 * Alert detail (RECOVERY-2): consumes /api/v1/alerts/[id] via TanStack
 * Query. Both official (INMET) and simulated alerts render through the
 * same domain-contract component; honesty labels come from the payload
 * (isOfficial/isSimulated), never guessed.
 */
export default function AlertaDetalhePage() {
  const params = useParams();
  const alertId = (params.id as string) ?? null;

  const { alert, loading, error } = useOfficialAlert(alertId);

  const notFound = !loading && !alert && error === 'Alerta não encontrado';
  const unavailable =
    !loading && !alert && error !== null && error !== 'Alerta não encontrado';

  return (
    <AppShell>
      <div className="space-y-6">
        <Link
          href="/alertas"
          className="inline-flex items-center gap-1 text-sm text-hydro-blue-600 hover:text-hydro-blue-700"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Voltar para alertas
        </Link>

        {loading ? (
          <div className="rounded-2xl border border-hydro-border bg-hydro-surface p-8 text-center">
            <p className="text-hydro-text-secondary">Carregando...</p>
          </div>
        ) : alert ? (
          <OfficialAlertDetail alert={alert} />
        ) : notFound ? (
          <div className="rounded-2xl border border-hydro-border bg-hydro-surface p-8 text-center">
            <p className="text-lg font-medium text-hydro-text">
              Alerta não encontrado
            </p>
            <p className="mt-1 text-sm text-hydro-text-secondary">
              O alerta solicitado não existe ou foi removido.
            </p>
            <Link href="/alertas" className="mt-4 inline-block">
              <Button variant="outline">Ver todos os alertas</Button>
            </Link>
          </div>
        ) : unavailable ? (
          <div className="rounded-2xl border border-hydro-border bg-hydro-surface p-8 text-center">
            <p className="text-lg font-medium text-hydro-text">
              Não foi possível consultar a fonte oficial
            </p>
            <p className="mt-1 text-sm text-hydro-text-secondary">
              Isso <strong className="text-hydro-text">não significa ausência de
              risco</strong>. Em emergência, ligue 192 / 193 / 199.
            </p>
            <Link href="/alertas" className="mt-4 inline-block">
              <Button variant="outline">Ver todos os alertas</Button>
            </Link>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
