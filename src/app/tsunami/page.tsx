'use client';

import { AppShell } from '@/components/layout/AppShell';
import { CoastalStatus } from '@/components/tsunami/CoastalStatus';
import { SafetyInfo } from '@/components/tsunami/SafetyInfo';
import { Waves } from 'lucide-react';

export default function TsunamiPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-hydro-text">
            Riscos Costeiros e Tsunami
          </h1>
          <p className="text-sm text-hydro-text-secondary">
            Monitoramento de áreas costeiras — dados simulados
          </p>
        </div>

        {/* Coastal-themed warning card.
            Plain div on purpose: overriding Card's bg via className fights
            CSS source order (bg-hydro-surface could win over
            bg-hydro-navy-950), which produced white-on-white text. */}
        <div className="rounded-2xl border border-hydro-navy-800 bg-hydro-navy-950 p-4 shadow-hydro-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-hydro-blue-600/20 shrink-0">
              <Waves className="h-6 w-6 text-hydro-cyan-400" aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold text-hydro-text-on-dark">
                Atenção: Dados de Demonstração
              </p>
              <p className="mt-1 text-sm text-hydro-text-on-dark/90">
                Todos os dados de tsunami e riscos costeiros nesta página são{' '}
                <strong>SIMULADOS</strong> para fins de demonstração da interface.{' '}
                Em caso de alerta real de tsunami, siga imediatamente as orientações{' '}
                oficiais da Defesa Civil, sirenes locais e canais de comunicação governamentais.
              </p>
            </div>
          </div>
        </div>

        <CoastalStatus />

        <SafetyInfo />
      </div>
    </AppShell>
  );
}
