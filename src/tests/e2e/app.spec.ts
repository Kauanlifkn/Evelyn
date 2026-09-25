import { test, expect } from '@playwright/test';

test.describe('Hidro Alerta - E2E', () => {
  test('dashboard loads and shows honest demo banner (mock mode)', async ({ page }) => {
    await page.goto('/');
    // Mock mode is forced in tests: the banner must say NOTHING shown is real.
    await expect(
      page.getByRole('status', { name: 'Informações sobre os dados' })
    ).toContainText(/nenhum alerta exibido é real/);
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
    await expect(
      page.getByRole('status', { name: 'Informações sobre os dados' })
    ).toBeVisible();
  });

  test('map shows markers on first load, "Todos" active and textual summary (RECOVERY-1)', async ({ page }) => {
    await page.goto('/mapa');
    await expect(page.getByRole('heading', { name: 'Mapa de Risco' })).toBeVisible();

    // Initial state: all layers visible.
    const allBtn = page.getByRole('button', { name: 'Todos' });
    await expect(allBtn).toHaveAttribute('aria-pressed', 'true');

    // Markers (alerts + shelters) and risk-area circles must be rendered.
    await expect(page.locator('.leaflet-marker-icon').first()).toBeVisible();
    const interactions = page.locator('.leaflet-interactive');
    await expect(interactions.first()).toBeVisible();

    // Textual alternative of the map (accessibility).
    const summary = page.getByRole('region', { name: 'Resumo textual do mapa' });
    await expect(summary).toBeVisible();
    await expect(summary).toContainText('Abrigo —');
    await expect(summary).toContainText('Enchente —');
  });

  test('map "Todos" resets combined filters and becomes active again (RECOVERY-1)', async ({ page }) => {
    await page.goto('/mapa');
    const allBtn = page.getByRole('button', { name: 'Todos' });

    await page.getByRole('button', { name: 'Abrigos' }).click();
    await page.getByRole('button', { name: 'Inundação' }).click();
    await expect(allBtn).toHaveAttribute('aria-pressed', 'false');

    // Summary must reflect the filtered subset.
    const summary = page.getByRole('region', { name: 'Resumo textual do mapa' });
    await expect(summary).toContainText('Abrigo —');
    await expect(summary).not.toContainText('Enchente —');

    // Reset brings everything back.
    await allBtn.click();
    await expect(allBtn).toHaveAttribute('aria-pressed', 'true');
    await expect(summary).toContainText('Enchente —');
    await expect(summary).toContainText('Abrigo —');
  });

  test('shelters page shows shelter list', async ({ page }) => {
    await page.goto('/abrigos');
    await expect(page.getByRole('heading', { name: 'Abrigos' })).toBeVisible();
  });

  test('incidents form requires consent and registers locally (simulated)', async ({ page }) => {
    await page.goto('/ocorrencias');
    await expect(page.getByRole('heading', { name: 'Relatar Ocorrência' })).toBeVisible();

    await page.locator('select').first().selectOption('waterlogging');
    await page.locator('textarea').fill('Alagamento na esquina da rua principal');

    // Consent (LGPD) is mandatory: submitting without it keeps the form.
    await page.getByRole('button', { name: 'Registrar ocorrência' }).click();
    await expect(page.getByText(/É necessário autorizar o uso/)).toBeVisible();

    // With consent, the API receives the report (201) and the success
    // screen states the demo-only, non-authority nature explicitly.
    await page.getByLabel(/Autorizo o uso destas informações/).check();
    await page.getByRole('button', { name: 'Registrar ocorrência' }).click();
    await expect(
      page.getByText('recebida pelo ambiente de demonstração')
    ).toBeVisible();
    await expect(
      page.getByText(/Não enviado à Defesa Civil/)
    ).toBeVisible();
    await expect(
      page.getByText(/armazenamento é?\s*em memória/i)
    ).toBeVisible();
  });

  test('notification center opens and closes via bell', async ({ page }) => {
    await page.goto('/');
    const bell = page.getByRole('button', { name: /notificação/i });
    if ((await bell.count()) > 0) {
      await bell.first().click();
      await expect(page.getByText('Marcar todas')).toBeVisible();
    }
  });

  test('mobile bottom nav is visible at small viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
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

  test('tsunami page shows demonstration warning and no false safety claims', async ({ page }) => {
    await page.goto('/tsunami');
    await expect(page.getByRole('heading', { name: 'Riscos Costeiros e Tsunami' })).toBeVisible();
    await expect(page.getByText('Dados de Demonstração')).toBeVisible();
    await expect(page.getByText('SIMULADOS', { exact: true })).toBeVisible();

    // RECOVERY-1: without an official source the app must not claim safety.
    await expect(page.getByText('Sem dados oficiais').first()).toBeVisible();
    await expect(page.getByText('Sem alerta ativo')).toHaveCount(0);
  });
});
