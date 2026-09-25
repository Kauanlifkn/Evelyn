'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { IncidentForm } from '@/components/incidents/IncidentForm';
import { IncidentSuccess } from '@/components/incidents/IncidentSuccess';

export default function OcorrenciasPage() {
  const [recordedAt, setRecordedAt] = useState<string | null>(null);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-hydro-text">Relatar Ocorrência</h1>
          <p className="text-sm text-hydro-text-secondary">
            Registre uma ocorrência — demonstração local, nenhum envio real
          </p>
        </div>

        {recordedAt ? (
          <IncidentSuccess
            recordedAt={recordedAt}
            onReportAnother={() => setRecordedAt(null)}
          />
        ) : (
          <IncidentForm onSuccess={(at) => setRecordedAt(at)} />
        )}
      </div>
    </AppShell>
  );
}
