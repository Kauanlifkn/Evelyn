/**
 * Time helpers — single injection point so tests can make time
 * deterministic and a future worker/queue can share the same semantics.
 */

export function nowIso(): string {
  return new Date().toISOString();
}
