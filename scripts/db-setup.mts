/**
 * Cria (se necessário) bancos auxiliares e aplica migrations + seed.
 *   node --env-file=.env --experimental-strip-types scripts/db-setup.ts <nome_do_banco>
 * Usado para os bancos de integração e E2E (isolados do dev).
 */
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
  try {
    for (const line of readFileSync('.env', 'utf8').split('\n')) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)\s*$/);
      if (match) process.env[match[1]] ??= match[2];
    }
  } catch {
    // sem .env
  }
}

const targetDb = process.argv[2] || 'hidro_alerta_test';
const base = new URL(process.env.DATABASE_URL as string);
base.pathname = '/postgres';
const admin = new Pool({ connectionString: base.toString(), max: 1 });

try {
  const exists = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [targetDb]);
  if (exists.rowCount === 0) {
    await admin.query(`CREATE DATABASE "${targetDb}"`);
    console.log(`✔ banco criado: ${targetDb}`);
  } else {
    console.log(`✔ banco já existe: ${targetDb}`);
  }
} finally {
  await admin.end();
}

const targetUrl = new URL(process.env.DATABASE_URL as string);
targetUrl.pathname = `/${targetDb}`;

function run(cmd: string, env: Record<string, string>) {
  execSync(cmd, { stdio: 'inherit', env: { ...process.env, ...env } });
}

const urlEnv = { DATABASE_URL: targetUrl.toString() };
run('npx tsx scripts/db-migrate.mts', urlEnv);
run('npx tsx scripts/db-seed.mts', urlEnv);
console.log(`✔ setup completo: ${targetDb}`);
process.exit(0);
