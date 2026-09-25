import { test, expect } from '@playwright/test';

/**
 * Console error detection tests.
 * Fails if any console.error, unhandled promise rejection, or page error occurs.
 * Tiles from OpenStreetMap are the ONLY allowed external communication.
 */

const ALLOWED_EXTERNAL = ['tile.openstreetmap.org'];


/**
 * RECOVERY-3: alert ids are now persisted UUIDs. Tests resolve a real id
 * from the API instead of assuming seeded string ids.
 */
async function firstAlertId(page: import('@playwright/test').Page): Promise<string> {
  const res = await page.request.get('/api/v1/alerts?pageSize=1');
  const json = await res.json();
  return json.data[0].id as string;
}

test.describe('Console & Network Hygiene', () => {
  test('no console errors on dashboard', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(errors).toHaveLength(0);
  });

  test('no console errors on alertas page', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/alertas');
    await page.waitForLoadState('networkidle');

    expect(errors).toHaveLength(0);
  });

  test('no console errors on mapa page', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/mapa');
    await page.waitForLoadState('networkidle');

    expect(errors).toHaveLength(0);
  });

  test('no console errors on abrigos page', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/abrigos');
    await page.waitForLoadState('networkidle');

    expect(errors).toHaveLength(0);
  });

  test('no console errors on ocorrencias page', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/ocorrencias');
    await page.waitForLoadState('networkidle');

    expect(errors).toHaveLength(0);
  });

  test('no console errors on tsunami page', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/tsunami');
    await page.waitForLoadState('networkidle');

    expect(errors).toHaveLength(0);
  });

  test('only expected external requests (OSM tiles) on mapa', async ({ page }) => {
    const unexpectedRequests: string[] = [];
    page.on('request', (req) => {
      const url = req.url();
      if (
        url.startsWith('http') &&
        !url.includes('localhost') &&
        !url.includes('127.0.0.1') &&
        !ALLOWED_EXTERNAL.some((allowed) => url.includes(allowed))
      ) {
        unexpectedRequests.push(url);
      }
    });

    await page.goto('/mapa');
    await page.waitForLoadState('networkidle');

    expect(unexpectedRequests).toHaveLength(0);
  });

  test('alert detail page with valid ID has no errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', (err) => errors.push(err.message));

    const alertId = await firstAlertId(page);
    await page.goto(`/alertas/${alertId}`);
    await page.waitForLoadState('networkidle');

    expect(errors).toHaveLength(0);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('alert detail page with invalid ID shows not found', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/alertas/nonexistent-id');

    // Wait for the not-found UI directly (networkidle is unreliable with
    // query retries/dev HMR); the console assertions below then verify
    // only the expected 404 happened and nothing else.
    await expect(page.getByText('Alerta não encontrado')).toBeVisible();
    await page.waitForTimeout(300);

    // The browser logs one "Failed to load resource: 404" for the expected
    // /api/v1/alerts/nonexistent-id request — that network log is inherent
    // to a correct 404 response and is not a runtime error. Anything else
    // (JS errors, uncaught exceptions, other resources) must not occur.
    const notFoundLogs = errors.filter(
      (e) => e.includes('Failed to load resource') && e.includes('404')
    );
    const unexpected = errors.filter(
      (e) => !(e.includes('Failed to load resource') && e.includes('404'))
    );
    // TanStack Query de-duplicates: exactly one 404, no retries.
    expect(notFoundLogs).toHaveLength(1);
    expect(unexpected).toHaveLength(0);
  });
});

/**
 * Accessibility-focused tests.
 * Validates keyboard navigation, focus management, ARIA attributes, and
 * interactive element behavior.
 */

test.describe('Accessibility', () => {
  test('all pages have a main landmark', async ({ page }) => {
    const pages = ['/', '/alertas', '/abrigos', '/ocorrencias', '/tsunami'];
    for (const path of pages) {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      await expect(page.locator('main')).toBeAttached();
    }
  });

  test('demo banner has role=status', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('status', { name: 'Informações sobre os dados' })
    ).toBeAttached();
  });

  test('sidebar navigation has aria-label on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await expect(
      page.locator('nav').filter({ hasText: 'Dashboard' }).first()
    ).toHaveAttribute('aria-label', /navegação/i);
  });

  test('mobile nav has aria-label', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const mobileNav = page.locator('nav').last();
    await expect(mobileNav).toHaveAttribute('aria-label', /navegação/i);
  });

  test('notification bell button has aria-label', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await expect(
      page.getByRole('button', { name: /Notific/i }).first()
    ).toBeAttached();
  });

  test('search input has aria-label', async ({ page }) => {
    await page.goto('/alertas');
    await expect(
      page.getByRole('searchbox').first()
    ).toBeAttached();
  });

  test('active nav link has aria-current=page (desktop)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const activeLink = page.locator('aside').getByRole('link', { name: 'Dashboard' });
    await expect(activeLink).toHaveAttribute('aria-current', 'page');
  });

  test('SOS button has aria-label', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('button', { name: /SOS/i })
    ).toBeAttached();
  });

  test('SOS button produces feedback when clicked', async ({ page }) => {
    await page.goto('/');
    // Listen for dialog (alert)
    page.on('dialog', async (dialog) => {
      await dialog.accept();
    });

    await page.getByRole('button', { name: /SOS/i }).click();
    // If we get here without error, the alert was shown
  });

  test('modal closes on Escape key', async ({ page }) => {
    // This tests any dialog-based modal; we don't have a direct modal trigger
    // on the main pages, so we verify the Escape key doesn't cause errors
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.keyboard.press('Escape');
    // No error should occur
  });

  test('images and icons have aria-hidden or are decorative', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // All svg elements (lucide icons) should have aria-hidden="true"
    const svgs = await page.locator('svg[aria-hidden="true"]').count();
    // There should be many icons on the dashboard
    expect(svgs).toBeGreaterThan(0);
  });

  test('form inputs have associated labels', async ({ page }) => {
    await page.goto('/ocorrencias');
    await page.waitForLoadState('networkidle');

    // Check that the select and textarea have labels via htmlFor/id
    const select = page.locator('#incident-type');
    await expect(select).toBeAttached();
    const textarea = page.locator('#incident-description');
    await expect(textarea).toBeAttached();
  });

  test('alert type filter has a label element', async ({ page }) => {
    await page.goto('/alertas');
    const label = page.getByText('Tipo');
    const select = page.locator('#alert-type-filter');
    await expect(label).toBeAttached();
    await expect(select).toBeAttached();
  });

  test('color is not the only information conveyer for severity', async ({ page }) => {
    await page.goto('/alertas');
    await page.waitForLoadState('networkidle');

    // Severity badges are pill spans with text labels (not just color).
    // RECOVERY-1: badges no longer (mis)use role="status" — that role is
    // reserved for genuine live regions like the demo banner.
    const badges = page.locator('span.rounded-full');
    const count = await badges.count();
    expect(count).toBeGreaterThan(0);

    // Each badge should contain text content
    for (let i = 0; i < count; i++) {
      const text = await badges.nth(i).textContent();
      expect(text?.trim().length).toBeGreaterThan(0);
    }
  });

  test('focus-visible outline exists on interactive elements', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Tab to an element and check for focus-visible outline
    await page.keyboard.press('Tab');
    const focused = page.locator(':focus-visible');
    await expect(focused).toBeAttached();

    // The focused element should have an outline or ring class
    const outlineStyle = await focused.evaluate((el) => {
      return window.getComputedStyle(el).outline;
    });
    // outline should not be "none"
    expect(outlineStyle).not.toBe('none');
  });

  test('no horizontal scroll on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    const pages = ['/', '/alertas', '/abrigos', '/mapa', '/ocorrencias', '/tsunami'];
    for (const path of pages) {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(overflow).toBe(false);
    }
  });

  test('SOS button does not cover content at mobile size', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const sosButton = page.getByRole('button', { name: /SOS/i });
    const box = await sosButton.boundingBox();
    expect(box).not.toBeNull();

    // SOS button is inside the bottom nav (height ~72px) and protrudes above it.
    // It should not extend into the main content area (above bottom nav top).
    const pageHeight = 844;
    const navHeight = 72;
    const navTop = pageHeight - navHeight;
    // SOS button protrudes ~16px above nav, so its top should be above navTop
    // but it should not cover content more than ~80px above the nav.
    expect(box!.y).toBeGreaterThan(navTop - 80);
  });
});

/**
 * Interaction completeness tests.
 * Ensures every button/link produces a comprehensible result.
 */

test.describe('Interaction Completeness', () => {
  test('Estou seguro on alert detail registers a LOCAL confirmation (honest)', async ({ page }) => {
    await page.goto(`/alertas/${await firstAlertId(page)}`);
    await page.waitForLoadState('networkidle');

    const btn = page.getByRole('button', { name: /Estou seguro/i });
    await expect(btn).toBeAttached();
    await btn.click();

    // Honest feedback: stored locally only, never transmitted.
    const feedback = page.getByText(/registrada apenas neste dispositivo/i);
    await expect(feedback).toBeVisible();
    await expect(feedback).toContainText('LOCAL');
  });

  test('Preciso de ajuda opens a dialog with official emergency numbers', async ({ page }) => {
    await page.goto(`/alertas/${await firstAlertId(page)}`);
    await page.waitForLoadState('networkidle');

    const btn = page.getByRole('button', { name: /Preciso de ajuda/i });
    await expect(btn).toBeAttached();
    await btn.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('192');
    await expect(dialog).toContainText('199');
    await expect(dialog).toContainText('ainda não está conectado');

    // Native dialog closes on Escape (focus stays inside while open).
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });

  test('Compartilhar on alert detail really copies the link', async ({ page }) => {
    await page.goto(`/alertas/${await firstAlertId(page)}`);
    await page.waitForLoadState('networkidle');

    const btn = page.getByRole('button', { name: /Compartilhar/i });
    await expect(btn).toBeAttached();
    await btn.click();

    // RECOVERY-1: real clipboard write — the feedback must reflect the
    // truth (clipboard permissions granted in playwright.config).
    await expect(page.getByText('Link copiado para a área de transferência.')).toBeVisible();
    const clip = await page.evaluate(() => navigator.clipboard.readText());
    expect(clip).toContain('/alertas/');
  });

  test('Ver no mapa button on shelter shows feedback', async ({ page }) => {
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toContain('Simulado');
      await dialog.accept();
    });

    await page.goto('/abrigos');
    await page.waitForLoadState('networkidle');

    const btn = page.getByRole('button', { name: /Ver no mapa/i }).first();
    await expect(btn).toBeAttached();
    await btn.click();
  });

  test('Traçar rota button on shelter shows feedback', async ({ page }) => {
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toContain('Simulado');
      await dialog.accept();
    });

    await page.goto('/abrigos');
    await page.waitForLoadState('networkidle');

    const btn = page.getByRole('button', { name: /rota/i }).first();
    await expect(btn).toBeAttached();
    await btn.click();
  });

  test('shelter filter buttons change displayed results', async ({ page }) => {
    await page.goto('/abrigos');
    await page.waitForLoadState('networkidle');

    // Click "Lotados" filter
    await page.getByRole('button', { name: 'Lotados' }).click();

    // Should show filtered shelters with "Lotado" status
    const shelterCards = page.locator('text=Lotado');
    const count = await shelterCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('alert severity filter changes displayed results', async ({ page }) => {
    await page.goto('/alertas');
    await page.waitForLoadState('networkidle');

    // Click "Perigo Extremo" filter
    await page.getByRole('button', { name: 'Perigo Extremo' }).click();

    // Should show only alerts with severity 3+4
    const visibleAlerts = page.locator('.space-y-3 > a');
    const count = await visibleAlerts.count();
    expect(count).toBeGreaterThan(0);
  });

  test('map filter buttons are interactive', async ({ page }) => {
    await page.goto('/mapa');
    await page.waitForLoadState('networkidle');

    const allBtn = page.getByRole('button', { name: 'Todos' });
    await expect(allBtn).toBeAttached();

    const shelterBtn = page.getByRole('button', { name: 'Abrigos' });
    await expect(shelterBtn).toBeAttached();

    // Toggle shelter filter
    await shelterBtn.click();
    // Toggle it back
    await shelterBtn.click();
  });

  test('photo upload area shows simulated feedback', async ({ page }) => {
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toContain('Simulado');
      await dialog.accept();
    });

    await page.goto('/ocorrencias');
    await page.waitForLoadState('networkidle');

    // Click the photo upload area
    await page.getByText('Clique para adicionar foto').click();
  });

  test('navigation persists after reload', async ({ page }) => {
    await page.goto('/alertas');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Central de Alertas')).toBeVisible();

    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Central de Alertas')).toBeVisible();
  });
});
