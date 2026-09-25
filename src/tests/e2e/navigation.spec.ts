import { test, expect } from '@playwright/test';

/**
 * RECOVERY-1 regressions: functional sidebar search and notification links
 * that never lead to 404.
 */

test.describe('Sidebar search (functional navigation)', () => {
  test('navigates to an alert via keyboard Enter', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    const input = page.getByRole('combobox', { name: 'Buscar no menu' });
    await input.fill('petrópolis');
    await expect(page.getByRole('listbox')).toBeVisible();

    await input.press('Enter');
    await expect(page).toHaveURL(/\/alertas\/alert-\d{3}$/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('navigates to shelters via mouse click', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    const input = page.getByRole('combobox', { name: 'Buscar no menu' });
    await input.fill('Grêmio');
    const option = page
      .getByRole('option')
      .filter({ hasText: 'Arena do Grêmio' })
      .first();
    await expect(option).toBeVisible();
    await option.click();

    await expect(page).toHaveURL(/\/abrigos$/);
  });

  test('shows an empty state for unknown queries', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    const input = page.getByRole('combobox', { name: 'Buscar no menu' });
    await input.fill('zzz-inexistente');
    await expect(page.getByRole('listbox')).toContainText('Nenhum resultado');
  });
});

test.describe('Notification links (zero 404)', () => {
  test('clicking a linked notification navigates to the alert detail', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    await page.getByRole('button', { name: 'Notificações' }).click();
    const item = page.getByText('Alerta de Enchente Ativado').first();
    await expect(item).toBeVisible();
    await item.click();

    // Link from the mock previously pointed to /alerts/alert-001 (404).
    await expect(page).toHaveURL(/\/alertas\/alert-001$/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('no visible link uses the removed English route prefixes', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Notificações' }).click();

    const hrefs = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a[href]'))
        .map((a) => a.getAttribute('href') ?? '')
        .filter((h) => h.startsWith('/'));
    });

    const bad = hrefs.filter(
      (h) =>
        h.startsWith('/alerts/') ||
        h.startsWith('/shelters/') ||
        h.startsWith('/incidents/')
    );
    expect(bad).toEqual([]);
  });
});
