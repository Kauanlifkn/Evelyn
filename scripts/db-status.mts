/** npm run db:status — migrations aplicadas + contagens por tabela. */
import { readFileSync } from 'node:fs';
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

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
try {
  const mig = await pool.query(
    'SELECT hash, created_at FROM drizzle.__drizzle_migrations ORDER BY created_at'
  );
  console.log(`migrations aplicadas: ${mig.rowCount}`);
  for (const table of ['territories', 'data_sources', 'source_health', 'alerts', 'alert_areas', 'shelters', 'incidents', 'sensors', 'observations']) {
    const r = await pool.query(`SELECT count(*)::int AS n FROM ${table}`);
    console.log(`  ${table}: ${r.rows[0].n}`);
  }
  const postgis = await pool.query('SELECT postgis_version() AS v');
  console.log(`PostGIS: ${postgis.rows[0].v}`);
} finally {
  await pool.end();
}
