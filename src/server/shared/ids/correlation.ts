/**
 * Correlation ID (RECOVERY-2).
 *
 * - Accepts `x-correlation-id` when it is a safe token (letters, digits,
 *   and `-_.`), 8–128 chars — avoids header injection/log forging.
 * - Otherwise generates a UUID.
 * - Every API response echoes it via `x-correlation-id`, and every log
 *   line carries the same id.
 */

const CORRELATION_HEADER = 'x-correlation-id';
const SAFE_CORRELATION_RE = /^[A-Za-z0-9][A-Za-z0-9._-]{7,127}$/;

export function isValidCorrelationId(value: string | null | undefined): value is string {
  return typeof value === 'string' && SAFE_CORRELATION_RE.test(value);
}

export function generateCorrelationId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  // Deterministic-safe fallback (crypto is available in all supported
  // runtimes; this branch is defensive only).
  return `corr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

export function resolveCorrelationId(request: Request): string {
  const incoming = request.headers.get(CORRELATION_HEADER);
  if (isValidCorrelationId(incoming)) return incoming;
  return generateCorrelationId();
}

export const CORRELATION_ID_HEADER = CORRELATION_HEADER;
