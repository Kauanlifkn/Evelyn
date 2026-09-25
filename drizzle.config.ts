import { readFileSync } from 'node:fs';
import type { Config } from 'drizzle-kit';

/**
 * drizzle-kit configuration (RECOVERY-3).
 *
 * Loads .env manually (kit CLI runs before Next's env loading).
 * Commands:
 *   npm run db:generate  → gera SQL em ./drizzle a partir do schema
 *   npm run db:migrate   → aplica migrations (DATABASE_URL)
 * `db:push` é PROIBIDO fora de descarte local (ADR 0006).
 */

if (!process.env.DATABASE_URL) {
  try {
    for (const line of readFileSync('.env', 'utf8').split('\n')) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)\s*$/);
      if (match) process.env[match[1]] ??= match[2];
    }
  } catch {
    // .env ausente — variáveis virão do ambiente.
  }
}

export default {
  dialect: 'postgresql',
  schema: './src/server/infrastructure/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      'postgres://hidro:hidro_dev_password@localhost:5434/hidro_alerta',
  },
  verbose: true,
  strict: true,
} satisfies Config;
