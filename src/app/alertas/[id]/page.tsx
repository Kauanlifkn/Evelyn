'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { AlertDetail } from '@/components/alerts/AlertDetail';
import { Button } from '@/components/ui/Button';
import { mockAlerts } from '@/data/mocks/alerts';
import { ArrowLeft } from 'lucide-react';

export default function AlertaDetalhePage() {
  const params = useParams();
  const alertId = params.id as string;
  const alert = mockAlerts.find((a) => a.id === alertId);

  return (
    <AppShell>
      <div className="space-y-6">
        <Link href="/alertas" className="inline-flex items-center gap-1 text-sm text-hydro-blue-600 hover:text-hydro-blue-700">
          <ArrowLeft className="h-4 w-4" />
          Voltar para alertas
        </Link>

        {alert ? (
          <AlertDetail alert={alert} />
        ) : (
          <div className="rounded-2xl border border-hydro-border bg-hydro-surface p-8 text-center">
            <p className="text-lg font-medium text-hydro-text">Alerta não encontrado</p>
            <p className="mt-1 text-sm text-hydro-text-secondary">
              O alerta solicitado não existe ou foi removido.
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
