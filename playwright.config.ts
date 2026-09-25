import { defineConfig, devices } from '@playwright/test';
import { readFileSync } from 'node:fs';

/** Minimal .env loader (Playwright config runs outside Next). */
function env(): Record<string, string> {
  const out: Record<string, string> = {};
  try {
    for (const line of readFileSync('.env', 'utf8').split('\n')) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)\s*$/);
      if (match) out[match[1]] = match[2];
    }
  } catch {
    // sem .env — usa defaults documentados
  }
  return out;
}

const dotEnv = env();
const testDbUrl =
  process.env.TEST_DATABASE_URL ??
  dotEnv.TEST_DATABASE_URL ??
  'postgres://hidro:hidro_dev_password@localhost:5434/hidro_alerta_test';
const redisUrl = process.env.REDIS_URL ?? dotEnv.REDIS_URL ?? 'redis://localhost:6379';

export default defineConfig({
  globalSetup: './src/tests/e2e/global-setup.mts',
  testDir: './src/tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
    // Deterministic clipboard for the share feature (secure context).
    permissions: ['clipboard-read', 'clipboard-write'],
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    env: {
      // Hermetic E2E (HIDRO-ALERTA.md §19): mock data mode, and the
      // ISOLATED e2e database provisioned by globalSetup.
      ALERT_DATA_MODE: 'mock',
      PERSISTENCE_DRIVER: 'postgres',
      DATABASE_URL: testDbUrl,
      REDIS_URL: redisUrl,
    },
  },
});
