import { test, expect } from '@playwright/test';

test.describe('Official Alerts Integration', () => {
  test('dashboard loads and shows source status', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('alertas page loads and shows filter UI', async ({ page }) => {
    await page.goto('/alertas');
    await expect(page.getByRole('heading', { name: 'Central de Alertas' })).toBeVisible();
  });

  test('banner shows the honest mock-mode message (single status region)', async ({ page }) => {
    await page.goto('/');
    // Mock mode is forced in tests; the badge role="status" misuse is fixed,
    // so there must be exactly ONE status region at page level: the banner.
    const statuses = page.getByRole('status');
    await expect(statuses).toHaveCount(1);
    await expect(statuses).toContainText(/nenhum alerta exibido é real/);
  });

  test('mock alerts never render the OFICIAL badge (RECOVERY-1 honesty)', async ({ page }) => {
    await page.goto('/alertas');
    // In mock mode every alert card is simulated; none may claim to be
    // official.
    await expect(page.getByText('OFICIAL')).toHaveCount(0);
  });
});
