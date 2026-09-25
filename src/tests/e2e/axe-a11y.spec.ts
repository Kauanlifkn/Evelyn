import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * RECOVERY-1: automated accessibility scans (axe-core) on every route.
 * Bar: zero critical or serious WCAG A/AA violations. Minor issues found
 * by axe are tolerated only while documented in the compliance matrix.
 */

const PAGES = ['/', '/mapa', '/alertas', '/abrigos', '/ocorrencias', '/tsunami'];

test.describe('Accessibility (axe-core WCAG A/AA)', () => {
  for (const path of PAGES) {
    test(`no critical/serious violations on ${path}`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
        .analyze();

      const blocking = results.violations.filter((v) =>
        v.impact === 'critical' || v.impact === 'serious'
      );

      if (blocking.length > 0) {
        const report = blocking
          .map(
            (v) =>
              `${v.id} (${v.impact}): ${v.nodes
                .slice(0, 3)
                .map((n) => `${n.target.join(' ')} ⇒ ${n.html.slice(0, 160)}`)
                .join('\n  ')}`
          )
          .join('\n');
        throw new Error(`Violations on ${path}:\n${report}`);
      }
      expect(blocking).toHaveLength(0);
    });
  }

  test('no critical/serious violations on alert detail', async ({ page }) => {
    await page.goto('/alertas/alert-001');
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
      .analyze();

    const blocking = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );
    expect(blocking).toHaveLength(0);
  });

  test('skip link is the first focusable element', async ({ page }) => {
    await page.goto('/');

    await page.keyboard.press('Tab');
    const focused = page.locator(':focus-visible');
    await expect(focused).toHaveText(/Pular para o conteúdo principal/i);

    // Activating it moves focus into the main content.
    await page.keyboard.press('Enter');
    await expect(page.locator('#conteudo-principal')).toBeFocused();
  });

  test('map has a textual alternative (mapa is never the only channel)', async ({ page }) => {
    await page.goto('/mapa');
    await page.waitForLoadState('networkidle');

    const summary = page.getByRole('region', { name: 'Resumo textual do mapa' });
    await expect(summary).toBeVisible();
    await expect(summary.locator('li').first()).toBeVisible();
  });
});
