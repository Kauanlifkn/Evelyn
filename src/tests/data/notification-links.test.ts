import { describe, it, expect } from 'vitest';
import { mockNotifications } from '@/data/mocks/notifications';
import { mockAlerts } from '@/data/mocks/alerts';

/**
 * Regression (RECOVERY-1): notification links previously pointed to
 * non-existent routes (/alerts/*, /shelters/*, /incidents/*) causing 404s.
 * Every notification link must resolve to a real route of the app and,
 * when it targets an alert, the alert id must exist.
 */
describe('notification links', () => {
  // Static routes that actually exist in the app.
  const EXISTING_ROUTES = new Set([
    '/',
    '/mapa',
    '/alertas',
    '/abrigos',
    '/ocorrencias',
    '/tsunami',
  ]);

  const alertIds = new Set(mockAlerts.map((a) => a.id));

  it('never uses the removed English route prefixes', () => {
    mockNotifications.forEach((n) => {
      if (n.link) {
        expect(n.link).not.toMatch(/^\/alerts\//);
        expect(n.link).not.toMatch(/^\/shelters\//);
        expect(n.link).not.toMatch(/^\/incidents\//);
      }
    });
  });

  it('every link resolves to an existing static route or an existing alert', () => {
    mockNotifications.forEach((n) => {
      if (!n.link) return;
      if (EXISTING_ROUTES.has(n.link)) return;

      const alertMatch = n.link.match(/^\/alertas\/(.+)$/);
      expect(alertMatch, `link ${n.link} deve ser rota estática ou /alertas/[id]`).not.toBeNull();
      expect(
        alertIds.has(alertMatch![1]),
        `link ${n.link} aponta para alerta inexistente`
      ).toBe(true);
    });
  });

  it('notifications with links exist (coverage of the regression scenario)', () => {
    const withLinks = mockNotifications.filter((n) => Boolean(n.link));
    expect(withLinks.length).toBeGreaterThan(0);
  });
});
