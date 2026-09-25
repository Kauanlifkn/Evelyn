/**
 * Redis client (RECOVERY-3).
 *
 * Used ONLY for: distributed rate limiting, short-lived caches and sync
 * locks. NEVER a source of truth — the database is.
 *
 * - One lazy client per process (globalThis), small retry budget so a
 *   down Redis fails fast instead of hanging requests.
 * - Failure policy (documented): read paths degrade gracefully and the
 *   rate limiter falls back to the in-memory limiter — public reads are
 *   never taken down by Redis.
 */

import Redis from 'ioredis';

const globalStore = globalThis as unknown as {
  __hidroAlertaRedis?: Redis;
};

export function redisUrl(): string | undefined {
  return process.env.REDIS_URL;
}

export function getRedis(): Redis | null {
  if (!redisUrl()) return null;
  if (!globalStore.__hidroAlertaRedis) {
    globalStore.__hidroAlertaRedis = new Redis(redisUrl() as string, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      connectTimeout: 3_000,
      retryStrategy: (times) => (times > 3 ? null : Math.min(times * 200, 1_000)),
    });
    globalStore.__hidroAlertaRedis.on('error', () => {
      // ioredis emits 'error' on connection loss; swallow here so an
      // unhandled event cannot crash the process — callers handle
      // nulls/errors per operation (fail-open documented policy).
    });
  }
  return globalStore.__hidroAlertaRedis;
}

/** Ping; returns false when Redis is absent or unreachable. */
export async function pingRedis(): Promise<boolean> {
  const redis = getRedis();
  if (!redis) return false;
  try {
    if (redis.status !== 'ready') await redis.connect();
    const pong = await redis.ping();
    return pong === 'PONG';
  } catch {
    return false;
  }
}

export async function closeRedis(): Promise<void> {
  if (globalStore.__hidroAlertaRedis) {
    try {
      await globalStore.__hidroAlertaRedis.quit();
    } catch {
      globalStore.__hidroAlertaRedis.disconnect();
    }
    delete globalStore.__hidroAlertaRedis;
  }
}
