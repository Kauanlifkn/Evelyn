import { Info } from 'lucide-react';

interface DemoBannerProps {
  /**
   * Effective data mode: "official" (INMET alerts are real) or "mock"
   * (everything simulated). Resolved server-side from ALERT_DATA_MODE.
   */
  mode?: string;
}

export function DemoBanner({ mode = 'mock' }: DemoBannerProps) {
  const isOfficial = mode === 'official';

  const message = isOfficial
    ? 'Hidro Alerta em fase de testes — alertas meteorológicos do INMET são oficiais; demais módulos podem conter dados simulados.'
    : 'Hidro Alerta em fase de testes — todos os dados desta demonstração são simulados; nenhum alerta exibido é real.';

  return (
    <div
      className="bg-hydro-navy-950 text-hydro-text-on-dark text-center text-sm px-4 py-2.5 flex items-center justify-center gap-3"
      role="status"
      aria-label="Informações sobre os dados"
    >
      <span className="inline-flex items-center gap-1.5 rounded-md bg-hydro-warning/20 text-hydro-warning px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shrink-0">
        <Info className="h-3 w-3" aria-hidden="true" />
        {isOfficial ? 'Testes' : 'Demonstração'}
      </span>
      <span className="text-hydro-text-on-dark/90">{message}</span>
    </div>
  );
}
