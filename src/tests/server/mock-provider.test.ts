import { describe, it, expect } from 'vitest';
import { MockProvider } from '@/server/providers/alerts/mock-provider';
import { mockAlerts } from '@/data/mocks/alerts';

/**
 * Honesty regression (RECOVERY-1, HIDRO-ALERTA.md §1/§2): simulated data
 * must never be labeled as official. No mock may ever render the OFICIAL
 * badge.
 */
describe('MockProvider honesty', () => {
  const provider = new MockProvider();

  it('never marks alerts as official', async () => {
    const alerts = await provider.fetchActiveAlerts();
    expect(alerts.length).toBeGreaterThan(0);
    alerts.forEach((alert) => {
      expect(alert.isOfficial).toBe(false);
    });
  });

  it('always marks alerts as simulated', async () => {
    const alerts = await provider.fetchActiveAlerts();
    alerts.forEach((alert) => {
      expect(alert.isSimulated).toBe(true);
    });
  });

  it('uses the DEMO source type and MOCK source', async () => {
    const alerts = await provider.fetchActiveAlerts();
    alerts.forEach((alert) => {
      expect(alert.source).toBe('MOCK');
      expect(alert.sourceType).toBe('DEMO');
    });
  });

  it('returns exactly the active mock alerts (id mapping preserved)', async () => {
    const alerts = await provider.fetchActiveAlerts();
    const activeMockIds = mockAlerts
      .filter((a) => a.status === 'active')
      .map((a) => a.id)
      .sort();
    expect(alerts.map((a) => a.id).sort()).toEqual(activeMockIds);
  });

  it('health reports the MOCK source as ONLINE (demo is always available)', async () => {
    const health = provider.getSourceHealth();
    expect(health.source).toBe('MOCK');
    expect(health.status).toBe('ONLINE');
  });
});
