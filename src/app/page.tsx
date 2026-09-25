'use client';

import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { RiskGauge } from '@/components/dashboard/RiskGauge';
import { RiverLevelCard } from '@/components/dashboard/RiverLevelCard';
import { RainForecastCard } from '@/components/dashboard/RainForecastCard';
import { RiskPeopleCard } from '@/components/dashboard/RiskPeopleCard';
import { ActiveSheltersCard } from '@/components/dashboard/ActiveSheltersCard';
import { NearbyShelters } from '@/components/dashboard/NearbyShelters';
import { LastUpdate } from '@/components/dashboard/LastUpdate';
import { OfficialAlertCard } from '@/components/alerts/OfficialAlertCard';
import { AlertCard } from '@/components/alerts/AlertCard';
import { SourceStatus } from '@/components/alerts/SourceStatus';
import { useOfficialAlerts } from '@/hooks/useOfficialAlerts';
import { mockAlerts } from '@/data/mocks/alerts';
import { mockShelters } from '@/data/mocks/shelters';
import { mockRivers } from '@/data/mocks/rivers';
import { mockWeatherForecast } from '@/data/mocks/weather';
import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const mainRiver = mockRivers[0];
  const todayForecast = mockWeatherForecast[0];
  const activeShelters = mockShelters.filter(
    (s) => s.status === 'open' || s.status === 'crowded'
  );
  const { alerts: officialAlerts, meta, loading } = useOfficialAlerts();

  const isMockMode = meta?.dataMode === 'mock';
  const hasOfficial = meta?.isOfficial && meta.sourceStatus !== 'OFFLINE';
  const activeOfficialAlerts = officialAlerts.filter((a) => a.status === 'active');

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-bold text-hydro-text">Dashboard</h1>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-1">
            <p className="text-sm text-hydro-text-secondary">
              Visão geral do monitoramento de desastres
            </p>
            {hasOfficial && <SourceStatus />}
          </div>
        </div>

        {/* Official Alerts Section */}
        {hasOfficial && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="h-5 w-5 text-hydro-safe" />
              <h2 className="text-lg font-semibold text-hydro-text">
                Alertas Oficiais
              </h2>
              <span className="inline-flex items-center rounded-md bg-hydro-safe-soft text-hydro-safe-dark px-2 py-0.5 text-xs font-bold">
                {activeOfficialAlerts.length} ativo{activeOfficialAlerts.length !== 1 ? 's' : ''}
              </span>
            </div>
            {loading ? (
              <Card>
                <p className="text-sm text-hydro-text-secondary text-center py-4">
                  Carregando alertas oficiais...
                </p>
              </Card>
            ) : activeOfficialAlerts.length === 0 ? (
              <Card>
                <p className="text-sm text-hydro-text-secondary text-center py-4">
                  Nenhum alerta oficial ativo no momento.
                </p>
              </Card>
            ) : (
              <div className="space-y-2">
                {activeOfficialAlerts.slice(0, 5).map((alert) => (
                  <OfficialAlertCard key={alert.id} alert={alert} />
                ))}
                {activeOfficialAlerts.length > 5 && (
                  <Link
                    href="/alertas"
                    className="block text-center text-sm text-hydro-blue-600 hover:text-hydro-blue-700 font-medium py-2 transition-colors"
                  >
                    Ver todos os {activeOfficialAlerts.length} alertas →
                  </Link>
                )}
              </div>
            )}
            <p className="text-xs text-hydro-text-secondary mt-2">
              Fonte: {meta!.source} — Instituto Nacional de Meteorologia
            </p>
          </div>
        )}

        {/* Mock mode: show simulated alerts honestly labeled */}
        {!hasOfficial && !loading && isMockMode && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-lg font-semibold text-hydro-text">Alertas recentes</h2>
              <span className="inline-flex items-center rounded-md bg-hydro-warning/20 text-hydro-warning-dark px-2 py-0.5 text-xs font-bold">
                SIMULADO
              </span>
            </div>
            <div className="space-y-2">
              {mockAlerts.slice(0, 3).map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
            </div>
            <p className="text-xs text-hydro-text-secondary mt-2">
              Dados simulados — nenhum alerta desta lista é real. Modo de
              demonstração (ALERT_DATA_MODE=mock).
            </p>
          </div>
        )}

        {/* Official mode with failed source: honest unavailable state.
            Never imply that a missing alert means "no risk". */}
        {!hasOfficial && !loading && !isMockMode && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-lg font-semibold text-hydro-text">Alertas</h2>
              <span className="inline-flex items-center rounded-md bg-hydro-danger-soft text-hydro-danger-dark-text px-2 py-0.5 text-xs font-bold">
                FONTE INDISPONÍVEL
              </span>
            </div>
            <Card>
              <p className="text-sm text-hydro-text-secondary text-center py-4">
                A fonte oficial de alertas está temporariamente indisponível.
                Nenhuma informação oficial pode ser exibida neste momento —{' '}
                <strong className="text-hydro-text">
                  isso não significa ausência de risco
                </strong>
                . Em emergência, ligue 192 (SAMU), 193 (Bombeiros) ou 199
                (Defesa Civil).
              </p>
            </Card>
          </div>
        )}

        {/* Risk Gauge */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-hydro-text">
              Indicador Geral de Risco
            </h2>
            <span className="inline-flex items-center rounded-md bg-hydro-warning/20 text-hydro-warning-dark px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
              Simulado
            </span>
          </div>
          <RiskGauge level={2} />
          <p className="mt-2 text-xs text-hydro-text-secondary">
            Nível geral estimado para a região monitorada (dado simulado)
          </p>
        </Card>

        {/* Indicator Cards Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <RiverLevelCard
            name={mainRiver.name}
            level={mainRiver.currentLevel}
            maxLevel={mainRiver.maxLevel}
            warningLevel={mainRiver.warningLevel}
            status={mainRiver.status}
            lastUpdate={mainRiver.lastUpdate}
          />
          <RainForecastCard
            date={todayForecast.date}
            rainProbability={todayForecast.rainProbability}
            rainVolume={todayForecast.rainVolume}
            temperatureMin={todayForecast.temperatureMin}
            temperatureMax={todayForecast.temperatureMax}
          />
          <RiskPeopleCard count={12450} city="Região Metropolitana" />
          <ActiveSheltersCard count={activeShelters.length} totalCapacity={1800} />
        </div>

        {/* Simulated data notice for cards */}
        <p className="text-xs text-hydro-text-secondary text-center">
          Nível do rio, previsão de chuva, pessoas em risco e abrigos: dados simulados.
        </p>

        {/* Nearby Shelters */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-hydro-text">
              Abrigos Próximos
            </h2>
            <span className="inline-flex items-center rounded-md bg-hydro-warning/20 text-hydro-warning-dark px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
              Simulado
            </span>
          </div>
          <NearbyShelters shelters={mockShelters} />
        </div>

        {/* Last Update */}
        <LastUpdate time={new Date().toISOString()} />
      </div>
    </AppShell>
  );
}