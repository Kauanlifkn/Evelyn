import { Info } from 'lucide-react';

export function DemoBanner() {
  return (
    <div
      className="bg-hydro-navy-950 text-hydro-text-on-dark text-center text-sm px-4 py-2.5 flex items-center justify-center gap-3"
      role="status"
      aria-label="Ambiente de demonstração"
    >
      <span className="inline-flex items-center gap-1.5 rounded-md bg-hydro-warning/20 text-hydro-warning px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
        <Info className="h-3 w-3" />
        Demonstração
      </span>
      <span className="text-hydro-text-on-dark/90">
        Ambiente de demonstração — dados simulados. Nenhum alerta é real.
      </span>
    </div>
  );
}
