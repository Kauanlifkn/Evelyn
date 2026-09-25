/**
 * Health contracts (RECOVERY-2) — liveness vs readiness are different
 * questions and get different endpoints:
 *
 * - LIVENESS: "is this process able to answer?" — never depends on
 *   external sources (INMET being down must not kill the pod).
 * - READINESS: "can this process handle requests correctly?" — evaluates
 *   runtime + required configuration. Without a database yet, INMET
 *   availability is reported but does NOT fail readiness.
 */

import { z } from 'zod';

export const healthStatusSchema = z.enum(['healthy', 'degraded', 'unhealthy']);
export type HealthStatus = z.infer<typeof healthStatusSchema>;

export interface LivenessResult {
  status: 'healthy';
  uptimeSeconds: number;
  checkedAt: string;
}

export interface ReadinessCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message?: string;
}

export interface ReadinessResult {
  status: HealthStatus;
  checks: ReadinessCheck[];
  checkedAt: string;
}
