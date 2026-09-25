/**
 * Redis-backed distributed rate limiter (RECOVERY-3).
 *
 * Fixed window per key via INCR + EXPIRE (atomic-enough for rate limiting;
 * TTL is refreshed only on the first hit of a window).
 *
 * FAILURE POLICY (documented, doc-aligned "fail-safe sem derrubar leitura
 * pública"): if Redis is unavailable, enforcement FALLS BACK to the
 * in-memory limiter (per-process). Reads are never blocked by Redis
 * outages; the decision is logged as redis.error.
 */

import { logger } from '@/server/infrastructure/observability/logger';
import { getRedis } from '@/server/infrastructure/redis/client';
import { AppError } from '@/server/shared/errors/app-error';
import { RateLimiter } from './rate-limit';

export interface DistributedRateLimitOptions {
  limit: number;
  windowMs: number;
  /** Redis key prefix (default 'ratelimit'). */
  prefix?: string;
}

export class RedisRateLimiter {
  private readonly fallback: RateLimiter;

  constructor(private readonly options: DistributedRateLimitOptions) {
    this.fallback = new RateLimiter({
      limit: options.limit,
      windowMs: options.windowMs,
    });
  }

  resetFallback(): void {
    this.fallback.reset();
  }

  async enforce(
    key: string,
    now: number = Date.now()
  ): Promise<{ remaining: number }> {
    const redis = getRedis();
    const windowSeconds = Math.ceil(this.options.windowMs / 1000);
    const bucket = `${this.options.prefix ?? 'ratelimit'}:${key}:${Math.floor(now / this.options.windowMs)}`;

    if (redis) {
      try {
        if (redis.status !== 'ready') await redis.connect();
        const count = await redis.incr(bucket);
        if (count === 1) {
          await redis.expire(bucket, windowSeconds);
        }
        if (count > this.options.limit) {
          const ttl = await redis.ttl(bucket);
          throw AppError.rateLimited(
            'Muitas solicitações. Tente novamente mais tarde.',
            { retryAfterSeconds: ttl > 0 ? ttl : windowSeconds }
          );
        }
        return { remaining: Math.max(0, this.options.limit - count) };
      } catch (error) {
        if (error instanceof AppError) throw error;
        logger.warn('redis.error', {
          event_detail: 'rate_limit_fallback_memory',
        });
      }
    }

    // Fallback: per-process in-memory (documented limitation).
    this.fallback.enforce(key, now);
    return { remaining: 0 };
  }
}
