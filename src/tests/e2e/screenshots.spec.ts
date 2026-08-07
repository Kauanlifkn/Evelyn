import { test } from '@playwright/test';

const resolutions = [
  { name: 'mobile-390x844', width: 390, height: 844 },
  { name: 'tablet-768x1024', width: 768, height: 1024 },
  { name: 'desktop-1440x900', width: 1440, height: 900 },
];

const pages = [
  { path: '/', name: 'dashboard' },
  { path: '/mapa', name: 'mapa' },
  { path: '/alertas', name: 'alertas' },
  { path: '/abrigos', name: 'abrigos' },
  { path: '/ocorrencias', name: 'ocorrencias' },
  { path: '/tsunami', name: 'tsunami' },
];

for (const resolution of resolutions) {
  for (const pageDef of pages) {
    test(`screenshot ${resolution.name} ${pageDef.name}`, async ({ page }) => {
      await page.setViewportSize({ width: resolution.width, height: resolution.height });
      await page.goto(pageDef.path, { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
      await page.screenshot({
        path: `artifacts/screenshots/${resolution.name}-${pageDef.name}.png`,
        fullPage: true,
      });
    });
  }
}
