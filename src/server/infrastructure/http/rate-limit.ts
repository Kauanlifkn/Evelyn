/**
 * Fixed-window in-memory rate limiter (RECOVERY-2 — TRANSITIONAL).
 *
 * ⚠️ DOCUMENTED LIMITATION: this limiter is per-process. It is NOT suitable
 * for multi-instance/serverless deployments, where each instance keeps its
 * own counters. Redis will replace it in RECOVERY-3 (roadmap §R-3).
 *
 * Applied to mutable endpoints (POST /api/v1/incidents). Public GETs are
 * not limited in this phase.
 */

import { AppError } from '@/server/shared/errors/app-error';

export interface RateLimitOptions {
  /** Max requests allowed inside the window. */
  limit: number;
  /** Window size in milliseconds. */
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

interface WindowState {
  count: number;
  windowStart: number;
}

export class RateLimiter {
  private readonly buckets = new Map<string, WindowState>();

  constructor(private readonly options: RateLimitOptions) {}

  check(key: string, now: number = Date.now()): RateLimitResult {
    const { limit, windowMs } = this.options;
    let state = this.buckets.get(key);

    if (!state || now - state.windowStart >= windowMs) {
      state = { count: 0, windowStart: now };
      this.buckets.set(key, state);
    }

    state.count += 1;
    const allowed = state.count <= limit;
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((state.windowStart + windowMs - now) / 1000)
    );

    if (this.buckets.size > 10_000) {
      // Defensive cleanup so memory cannot grow unbounded under key
      // spoofing — drop windows that already expired.
      for (const [k, s] of this.buckets) {
        if (now - s.windowStart >= windowMs) this.buckets.delete(k);
      }
    }

    return {
      allowed,
      remaining: allowed ? Math.max(0, limit - state.count) : 0,
      retryAfterSeconds,
    };
  }

  enforce(key: string, now: number = Date.now()): RateLimitResult {
    const result = this.check(key, now);
    if (!result.allowed) {
      throw AppError.rateLimited(
        'Muitas solicitações. Tente novamente mais tarde.',
        { retryAfterSeconds: result.retryAfterSeconds }
      );
    }
    return result;
  }

  reset(): void {
    this.buckets.clear();
  }
}

/**
 * Best-effort client key. We deliberately do NOT persist or log IPs —
 * the key exists only as an in-memory rate-limit bucket.
 */
export function clientKey(request: Request, route: string): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || 'local';
  return `${route}:${ip}`;
}
