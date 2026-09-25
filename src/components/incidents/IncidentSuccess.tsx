'use client';

import { CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface IncidentSuccessProps {
  recordedAt: string;
  /** Server-provided heading (honesty depends on persistence driver). */
  heading: string;
  /** Server-provided honesty message (from the API meta). */
  message: string;
  onReportAnother: () => void;
}

export function IncidentSuccess({
  recordedAt,
  heading,
  message,
  onReportAnother,
}: IncidentSuccessProps) {
  return (
    <Card className="text-center py-8">
      <div className="flex justify-center mb-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-hydro-safe-soft">
          <CheckCircle className="h-8 w-8 text-hydro-safe" aria-hidden="true" />
        </div>
      </div>
      <h2 className="text-lg font-semibold text-hydro-text mb-2">{heading}</h2>
      <p className="text-sm text-hydro-text-secondary mb-2">
        Registrada em:{' '}
        <span className="font-medium text-hydro-text">
          {new Date(recordedAt).toLocaleString('pt-BR')}
        </span>
      </p>
      <p className="text-sm mb-2 rounded-xl bg-hydro-surface-blue text-hydro-text-secondary px-4 py-3">
        {message}
      </p>
      <p className="text-sm mb-6 rounded-xl bg-hydro-warning-soft text-hydro-warning-dark px-4 py-3">
        Em uma emergência real, ligue 192 (SAMU), 193 (Bombeiros) ou 199
        (Defesa Civil).
      </p>
      <Button onClick={onReportAnother}>
        Registrar outra ocorrência
      </Button>
    </Card>
  );
}
