'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { IncidentForm } from '@/components/incidents/IncidentForm';
import { IncidentSuccess } from '@/components/incidents/IncidentSuccess';

export default function OcorrenciasPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-hydro-text">Relatar Ocorrência</h1>
          <p className="text-sm text-hydro-text-secondary">
            Registre uma ocorrência — dados simulados, nenhum envio real
          </p>
        </div>

        {submitted ? (
          <IncidentSuccess
            onReportAnother={() => setSubmitted(false)}
          />
        ) : (
          <IncidentForm onSuccess={() => setSubmitted(true)} />
        )}
      </div>
    </AppShell>
  );
}
