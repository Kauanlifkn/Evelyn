'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { IncidentForm } from '@/components/incidents/IncidentForm';
import { IncidentSuccess } from '@/components/incidents/IncidentSuccess';

export default function OcorrenciasPage() {
  const [receipt, setReceipt] = useState<{
    recordedAt: string;
    message: string;
    heading: string;
  } | null>(null);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-hydro-text">Relatar Ocorrência</h1>
          <p className="text-sm text-hydro-text-secondary">
            Registre uma ocorrência — ambiente de demonstração, nenhum envio a órgãos públicos
          </p>
        </div>

        {receipt ? (
          <IncidentSuccess
            recordedAt={receipt.recordedAt}
            heading={receipt.heading}
            message={receipt.message}
            onReportAnother={() => setReceipt(null)}
          />
        ) : (
          <IncidentForm
            onSuccess={(recordedAt, message, heading) =>
              setReceipt({ recordedAt, message, heading })
            }
          />
        )}
      </div>
    </AppShell>
  );
}
