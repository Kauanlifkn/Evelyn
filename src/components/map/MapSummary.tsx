'use client';

import { Card } from '@/components/ui/Card';
import { getAlertTypeLabel, getShelterStatusLabel } from '@/lib/utils';
import type { Alert } from '@/types/alert';
import type { Shelter } from '@/types/shelter';
import type { RiskArea } from '@/types/map';

interface MapSummaryProps {
  alerts: Alert[];
  shelters: Shelter[];
  riskAreas: RiskArea[];
  filters: string[];
}

/**
 * Textual alternative to the map (HIDRO-ALERTA.md §6.3 "descrição textual
 * alternativa do mapa" and §2 "o mapa nunca poderá ser a única forma").
 * Lists exactly the items currently visible under the active filters.
 */
export function MapSummary({ alerts, shelters, riskAreas, filters }: MapSummaryProps) {
  const showAll = filters.length === 0;

  const visibleAlerts = showAll
    ? alerts
    : alerts.filter((a) => filters.includes(a.type));
  const visibleShelters = showAll
    ? shelters
    : filters.includes('shelter')
      ? shelters
      : [];
  const visibleRiskAreas = showAll
    ? riskAreas
    : riskAreas.filter((r) => filters.includes(r.type));

  const total =
    visibleAlerts.length + visibleShelters.length + visibleRiskAreas.length;

  return (
    <Card>
      <section aria-label="Resumo textual do mapa">
        <h2 className="text-sm font-semibold text-hydro-text mb-2">
          Resumo textual do mapa
        </h2>
        <p className="text-xs text-hydro-text-secondary mb-3">
          Alternativa ao mapa para quem não o utiliza — mesmos itens e
          filtros. Dados simulados.
        </p>

        {total === 0 ? (
          <p className="text-sm text-hydro-text-secondary">
            Nenhum item corresponde aos filtros atuais.
          </p>
        ) : (
          <ul className="space-y-1.5 text-sm text-hydro-text-secondary">
            {visibleAlerts.map((alert) => (
              <li key={`sum-${alert.id}`} className="flex items-start gap-2">
                <span
                  className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-hydro-orange"
                  aria-hidden="true"
                />
                <span>
                  {getAlertTypeLabel(alert.type)} — {alert.location}
                  <span className="text-xs">
                    {' '}(severidade {alert.severity}/4, simulado)
                  </span>
                </span>
              </li>
            ))}
            {visibleRiskAreas.map((area) => (
              <li key={`sum-${area.id}`} className="flex items-start gap-2">
                <span
                  className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-hydro-danger"
                  aria-hidden="true"
                />
                <span>
                  Área de risco — {area.name}
                  <span className="text-xs">
                    {' '}(nível {area.level}/4, simulado)
                  </span>
                </span>
              </li>
            ))}
            {visibleShelters.map((shelter) => (
              <li key={`sum-${shelter.id}`} className="flex items-start gap-2">
                <span
                  className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-hydro-safe"
                  aria-hidden="true"
                />
                <span>
                  Abrigo — {shelter.name}, {shelter.address}
                  <span className="text-xs">
                    {' '}({getShelterStatusLabel(shelter.status)},{' '}
                    {shelter.availableSpots} vagas, simulado)
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Card>
  );
}
