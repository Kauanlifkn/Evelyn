/**
 * Playwright globalSetup (RECOVERY-3): provisions the ISOLATED E2E
 * database (hidro_alerta_e2e) — migrate + deterministic seed — before the
 * webServer boots with DATABASE_URL pointing at it. Dev database is never
 * touched by the suite.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

function loadEnv(): void {
  if (process.env.DATABASE_URL) return;
  for (const line of readFileSync('.env', 'utf8').split('\n')) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)\s*$/);
    if (match) process.env[match[1]] ??= match[2];
  }
}

export default function globalSetup(): void {
  loadEnv();
  execFileSync('npx', ['tsx', 'scripts/db-setup.mts', 'hidro_alerta_e2e'], {
    stdio: 'inherit',
  });
}
