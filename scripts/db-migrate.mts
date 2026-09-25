/**
 * Migration runner (RECOVERY-3).
 *
 *   npm run db:migrate            → aplica migrations em DATABASE_URL
 *   MIGRATE_DATABASE_URL=... ...  → aplica em outro banco (ex.: test/e2e)
 *
 * Nunca executado automaticamente em requests (ver docs/DATABASE.md).
 */

import { readFileSync } from 'node:fs';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
  try {
    for (const line of readFileSync('.env', 'utf8').split('\n')) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)\s*$/);
      if (match) process.env[match[1]] ??= match[2];
    }
  } catch {
    // sem .env — usa ambiente
  }
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL ausente.');
  process.exit(1);
}

const pool = new Pool({ connectionString: url, max: 1 });
try {
  const db = drizzle(pool);
  await migrate(db, { migrationsFolder: './drizzle' });
  console.log('✔ migrations aplicadas em', url.replace(/:\/\/[^@]*@/, '://***@'));
  await pool.end();
} catch (error) {
  console.error('✖ falha nas migrations:', error instanceof Error ? error.message : error);
  await pool.end();
  process.exit(1);
}
