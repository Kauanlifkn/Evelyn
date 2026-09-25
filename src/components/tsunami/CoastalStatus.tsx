'use client';

import { Waves, AlertTriangle, HelpCircle } from 'lucide-react';
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
          Conteúdo educativo/demonstração. O Hidro Alerta ainda não está
          conectado a fontes oficiais de tsunami — nada aqui indica situação
          de segurança ou perigo real. Em caso de alerta real, procure
          sirenes e orientações da Defesa Civil e da Marinha do Brasil.
        </p>
      </div>

      {/* Status header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-hydro-blue-soft">
          <Waves className="h-5 w-5 text-hydro-blue-600" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-hydro-text">
            Monitoramento Costeiro
          </h2>
          <p className="text-xs text-hydro-text-secondary">
            Nenhuma fonte oficial conectada — conteúdo demonstrativo
          </p>
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
                <p className="text-xs text-hydro-text-secondary">
                  Monitoramento oficial não conectado
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <HelpCircle className="h-4 w-4 text-hydro-text-secondary" aria-hidden="true" />
                <span className="text-sm font-medium text-hydro-text-secondary">
                  Sem dados oficiais
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <p className="text-xs text-hydro-text-secondary text-center italic">
        Conteúdo educativo/demonstração — não constitui informação de
        monitoramento real.
      </p>
    </div>
  );
}
