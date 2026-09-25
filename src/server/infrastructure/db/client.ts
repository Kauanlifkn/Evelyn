/**
 * PostgreSQL client (RECOVERY-3).
 *
 * - ONE pool per process, stored on globalThis: Next.js dev hot-reload and
 *   serverless invocations must NOT open a connection per request.
 * - Serverless note (documented in docs/DATABASE.md §Pooling): on Vercel,
 *   point DATABASE_URL at a pooled/external provider (e.g. PgBouncer or a
 *   managed pooled endpoint); local dev uses the Docker container.
 * - Never log the connection string.
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

export const DB_POOL_MAX = 10;

export function databaseUrl(): string | undefined {
  return process.env.DATABASE_URL;
}

export function persistenceDriver(): 'postgres' | 'memory' {
  const explicit = process.env.PERSISTENCE_DRIVER;
  if (explicit === 'postgres' || explicit === 'memory') return explicit;
  // Default: postgres when a URL exists, memory otherwise (unit tests).
  return databaseUrl() ? 'postgres' : 'memory';
}

function createPool(): Pool {
  const url = databaseUrl();
  if (!url) {
    throw new Error(
      'DATABASE_URL ausente: suba a infraestrutura (npm run infra:up) e configure o .env, ou defina PERSISTENCE_DRIVER=memory.'
    );
  }
  return new Pool({
    connectionString: url,
    max: DB_POOL_MAX,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    ssl: process.env.DATABASE_SSL === 'require' ? { rejectUnauthorized: false } : undefined,
  });
}

const globalStore = globalThis as unknown as {
  __hidroAlertaPool?: Pool;
  __hidroAlertaDb?: ReturnType<typeof drizzle<typeof schema>>;
};

export function getPool(): Pool {
  if (!globalStore.__hidroAlertaPool) {
    globalStore.__hidroAlertaPool = createPool();
  }
  return globalStore.__hidroAlertaPool;
}

export function getDb() {
  if (!globalStore.__hidroAlertaDb) {
    globalStore.__hidroAlertaDb = drizzle(getPool(), { schema });
  }
  return globalStore.__hidroAlertaDb;
}

/** Test/ops helper — closes the pool (e.g. after integration suites). */
export async function closePool(): Promise<void> {
  if (globalStore.__hidroAlertaPool) {
    await globalStore.__hidroAlertaPool.end();
    delete globalStore.__hidroAlertaPool;
    delete globalStore.__hidroAlertaDb;
  }
}

/** Liveness probe for the pool: SELECT 1. */
export async function pingDatabase(): Promise<boolean> {
  const client = await getPool().connect();
  try {
    await client.query('SELECT 1');
    return true;
  } finally {
    client.release();
  }
}

export async function postgisVersion(): Promise<string | null> {
  try {
    const result = await getPool().query('SELECT postgis_version() AS v');
    return (result.rows[0]?.v as string) ?? null;
  } catch {
    return null;
  }
}
