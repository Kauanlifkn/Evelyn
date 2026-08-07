'use client';

import { CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface IncidentSuccessProps {
  onReportAnother: () => void;
}

export function IncidentSuccess({ onReportAnother }: IncidentSuccessProps) {
  return (
    <Card className="text-center py-8">
      <div className="flex justify-center mb-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-hydro-safe-soft">
          <CheckCircle className="h-8 w-8 text-hydro-safe" />
        </div>
      </div>
      <h2 className="text-lg font-semibold text-hydro-text mb-2">
        Ocorrência registrada com sucesso (simulado)
      </h2>
      <p className="text-sm text-hydro-text-secondary mb-6">
        Em produção, a ocorrência seria enviada para validação pela Defesa Civil.
        Dados simulados.
      </p>
      <Button onClick={onReportAnother}>
        Registrar outra ocorrência
      </Button>
    </Card>
  );
}
