'use client';

import { Waves, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface CoastalCity {
  name: string;
  state: string;
}

const coastalCities: CoastalCity[] = [
  { name: 'Santos', state: 'SP' },
  { name: 'Florianópolis', state: 'SC' },
  { name: 'Recife', state: 'PE' },
  { name: 'Salvador', state: 'BA' },
];

export function CoastalStatus() {
  return (
    <div className="space-y-4">
      {/* Notice */}
      <div className="bg-hydro-navy-950 text-hydro-text-on-dark text-sm px-4 py-3 rounded-xl flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-hydro-warning" />
        <p className="text-hydro-text-on-dark/90">
          Dados de tsunami são demonstração. Em caso de alerta real, procure
          sirenes e orientações oficiais.
        </p>
      </div>

      {/* Status header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-hydro-blue-soft">
          <Waves className="h-5 w-5 text-hydro-blue-600" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-hydro-text">
            Monitoramento Costeiro
          </h2>
          <p className="text-xs text-hydro-text-secondary">Status simulado de todas as áreas</p>
        </div>
      </div>

      {/* Cities list */}
      <div className="space-y-3">
        {coastalCities.map((city) => (
          <Card key={`${city.name}-${city.state}`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-hydro-text">
                  {city.name}-{city.state}
                </h3>
                <p className="text-xs text-hydro-text-secondary">Sem alerta ativo</p>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-hydro-safe" />
                <span className="text-sm font-medium text-hydro-safe">Normal</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <p className="text-xs text-hydro-text-secondary text-center italic">
        Todos os dados acima são simulados. Nenhum monitoramento real está ativo.
      </p>
    </div>
  );
}
