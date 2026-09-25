/**
 * Health application service (RECOVERY-2).
 * Liveness never depends on external sources. Readiness evaluates runtime
 * + required configuration; INMET status is reported as a check but does
 * not fail readiness while there is no database/queue dependency.
 */

import type {
  LivenessResult,
  ReadinessCheck,
  ReadinessResult,
} from '@/server/domain/health/health.contract';
import { nowIso } from '@/server/shared/time';

const PROCESS_START = Date.now();
const VALID_DATA_MODES = new Set(['official', 'mock']);

export class HealthService {
  liveness(): LivenessResult {
    return {
      status: 'healthy',
      uptimeSeconds: Math.round((Date.now() - PROCESS_START) / 1000),
      checkedAt: nowIso(),
    };
  }

  readiness(dataMode: string): ReadinessResult {
    const checks: ReadinessCheck[] = [];

    checks.push({
      name: 'runtime',
      status: 'pass',
      message: 'processo Node responsivo',
    });

    if (VALID_DATA_MODES.has(dataMode)) {
      checks.push({
        name: 'config.dataMode',
        status: 'pass',
        message: `ALERT_DATA_MODE=${dataMode}`,
      });
    } else {
      checks.push({
        name: 'config.dataMode',
        status: 'fail',
        message: `ALERT_DATA_MODE inválido: "${dataMode}"`,
      });
    }

    checks.push({
      name: 'database',
      status: 'warn',
      message: 'sem banco nesta fase (RECOVERY-3)',
    });

    const failed = checks.some((c) => c.status === 'fail');
    const warned = checks.some((c) => c.status === 'warn');
    return {
      status: failed ? 'unhealthy' : warned ? 'degraded' : 'healthy',
      checks,
      checkedAt: nowIso(),
    };
  }
}
