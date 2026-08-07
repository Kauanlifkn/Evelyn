import { describe, it, expect } from 'vitest';
import { mockAlerts } from '@/data/mocks/alerts';
import { mockShelters } from '@/data/mocks/shelters';
import { mockIncidents } from '@/data/mocks/incidents';
import { mockNotifications } from '@/data/mocks/notifications';
import { mockRiskAreas } from '@/data/mocks/risk-areas';
import { mockRivers } from '@/data/mocks/rivers';
import { mockWeatherForecast } from '@/data/mocks/weather';
import { mockUser } from '@/data/mocks/user';
import { mockCities } from '@/data/mocks/user';

describe('Mock Data Integrity', () => {
  it('all alerts have isSimulated: true', () => {
    mockAlerts.forEach((alert) => {
      expect(alert.isSimulated).toBe(true);
    });
    expect(mockAlerts.length).toBeGreaterThanOrEqual(10);
  });

  it('all shelters have isSimulated: true', () => {
    mockShelters.forEach((shelter) => {
      expect(shelter.isSimulated).toBe(true);
    });
  });

  it('all incidents have isSimulated: true', () => {
    mockIncidents.forEach((incident) => {
      expect(incident.isSimulated).toBe(true);
    });
  });

  it('all notifications have isSimulated: true', () => {
    mockNotifications.forEach((notif) => {
      expect(notif.isSimulated).toBe(true);
    });
  });

  it('all risk areas have isSimulated: true', () => {
    mockRiskAreas.forEach((area) => {
      expect(area.isSimulated).toBe(true);
    });
  });

  it('all rivers have isSimulated: true', () => {
    mockRivers.forEach((river) => {
      expect(river.isSimulated).toBe(true);
    });
  });

  it('all weather forecasts have isSimulated: true', () => {
    mockWeatherForecast.forEach((wf) => {
      expect(wf.isSimulated).toBe(true);
    });
  });

  it('user has isSimulated: true', () => {
    expect(mockUser.isSimulated).toBe(true);
  });

  it('all cities have isSimulated: true', () => {
    mockCities.forEach((city) => {
      expect(city.isSimulated).toBe(true);
    });
  });

  it('cities have valid Brazilian coordinates', () => {
    mockCities.forEach((city) => {
      expect(city.latitude).toBeGreaterThan(-55);
      expect(city.latitude).toBeLessThan(5);
      expect(city.longitude).toBeGreaterThan(-75);
      expect(city.longitude).toBeLessThan(-33);
    });
  });
});
