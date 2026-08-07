'use client';

import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { RiskGauge } from '@/components/dashboard/RiskGauge';
import { RiverLevelCard } from '@/components/dashboard/RiverLevelCard';
import { RainForecastCard } from '@/components/dashboard/RainForecastCard';
import { RiskPeopleCard } from '@/components/dashboard/RiskPeopleCard';
import { ActiveSheltersCard } from '@/components/dashboard/ActiveSheltersCard';
import { RecentAlertsList } from '@/components/dashboard/RecentAlertsList';
import { NearbyShelters } from '@/components/dashboard/NearbyShelters';
import { LastUpdate } from '@/components/dashboard/LastUpdate';
import { mockAlerts } from '@/data/mocks/alerts';
import { mockShelters } from '@/data/mocks/shelters';
import { mockRivers } from '@/data/mocks/rivers';
import { mockWeatherForecast } from '@/data/mocks/weather';

export default function DashboardPage() {
  const mainRiver = mockRivers[0];
  const todayForecast = mockWeatherForecast[0];
  const activeShelters = mockShelters.filter(
    (s) => s.status === 'open' || s.status === 'crowded'
  );

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-bold text-hydro-text">Dashboard</h1>
          <p className="text-sm text-hydro-text-secondary">
            Visão geral do monitoramento de desastres — dados simulados
          </p>
        </div>

        {/* Risk Gauge */}
        <Card>
          <h2 className="mb-4 text-lg font-semibold text-hydro-text">
            Indicador Geral de Risco
          </h2>
          <RiskGauge level={2} />
          <p className="mt-2 text-sm text-hydro-text-secondary">
            Nível geral estimado para a região monitorada (simulado)
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

        {/* Recent Alerts */}
        <div>
          <h2 className="mb-3 text-lg font-semibold text-hydro-text">
            Alertas Recentes
          </h2>
          <RecentAlertsList alerts={mockAlerts} />
        </div>

        {/* Nearby Shelters */}
        <div>
          <h2 className="mb-3 text-lg font-semibold text-hydro-text">
            Abrigos Próximos
          </h2>
          <NearbyShelters shelters={mockShelters} />
        </div>

        {/* Last Update */}
        <LastUpdate time={new Date().toISOString()} />
      </div>
    </AppShell>
  );
}
