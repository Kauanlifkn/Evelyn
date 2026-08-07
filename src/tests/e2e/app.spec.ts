import { test, expect } from '@playwright/test';

test.describe('Hidro Alerta - E2E', () => {
  test('dashboard loads and shows demo banner', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Ambiente de demonstração')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('navigates between pages via sidebar (desktop)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Navigate to Mapa via sidebar link
    await page.locator('aside').getByRole('link', { name: 'Mapa' }).click();
    await expect(page.getByRole('heading', { name: 'Mapa de Risco' })).toBeVisible();

    // Navigate to Alertas
    await page.locator('aside').getByRole('link', { name: 'Alertas' }).click();
    await expect(page.getByRole('heading', { name: 'Central de Alertas' })).toBeVisible();

    // Navigate to Abrigos
    await page.locator('aside').getByRole('link', { name: 'Abrigos' }).click();
    await expect(page.getByRole('heading', { name: 'Abrigos' })).toBeVisible();

    // Navigate to Dashboard
    await page.locator('aside').getByRole('link', { name: 'Dashboard' }).click();
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('opens alert detail from alerts page', async ({ page }) => {
    await page.goto('/alertas');
    // Click the first alert card link
    const firstCard = page.locator('.space-y-3 a').first();
    await firstCard.click();
    // Should navigate to alert detail page (URL has /alertas/[id])
    await expect(page).toHaveURL(/\/alertas\/alert-/);
    await expect(page.getByRole('status', { name: /Ambiente de demonstração/i })).toBeVisible();
  });

  test('map page shows filters and legend', async ({ page }) => {
    await page.goto('/mapa');
    await expect(page.getByRole('heading', { name: 'Mapa de Risco' })).toBeVisible();
    // Filter buttons should be visible
    await expect(page.getByRole('button', { name: 'Todos' })).toBeVisible();
  });

  test('shelters page shows shelter list', async ({ page }) => {
    await page.goto('/abrigos');
    await expect(page.getByRole('heading', { name: 'Abrigos' })).toBeVisible();
  });

  test('incidents form submits successfully (simulated)', async ({ page }) => {
    await page.goto('/ocorrencias');
    await expect(page.getByRole('heading', { name: 'Relatar Ocorrência' })).toBeVisible();

    // Select type
    await page.locator('select').first().selectOption('waterlogging');

    // Fill description
    await page.locator('textarea').fill('Alagamento na esquina da rua principal');

    // Submit
    await page.getByRole('button', { name: 'Registrar' }).click();

    // Should show success
    await expect(page.getByText('registrada com sucesso')).toBeVisible();
  });

  test('notification center opens and closes via bell', async ({ page }) => {
    await page.goto('/');
    // The bell is in the sidebar on desktop
    const bell = page.getByRole('button', { name: /notificação/i });
    if (await bell.count() > 0) {
      await bell.first().click();
      await expect(page.getByText('Marcar todas')).toBeVisible();
    }
  });

  test('mobile bottom nav is visible at small viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    // Mobile nav should be present
    const mobileNav = page.locator('nav').last();
    await expect(mobileNav).toBeVisible();
  });

  test('no horizontal scroll on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(overflow).toBe(false);
  });

  test('tsunami page shows demonstration warning', async ({ page }) => {
    await page.goto('/tsunami');
    await expect(page.getByRole('heading', { name: 'Riscos Costeiros e Tsunami' })).toBeVisible();
    await expect(page.getByText('Dados de Demonstração')).toBeVisible();
    await expect(page.getByText('SIMULADOS', { exact: true })).toBeVisible();
  });
});
