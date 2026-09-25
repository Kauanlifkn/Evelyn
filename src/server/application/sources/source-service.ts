/**
 * Source application service (RECOVERY-2).
 * Exposes DataSource/SourceHealth contracts for the configured sources.
 * Health is a read model from the alert source port's provider layer.
 */

import type {
  DataSource,
  SourceHealth,
  SourceType,
} from '@/server/domain/sources/sources.contract';
import { nowIso } from '@/server/shared/time';

export interface LegacyHealthPort {
  getSourceHealth(): {
    source: string;
    status: 'ONLINE' | 'STALE' | 'OFFLINE';
    lastAttemptAt: string | null;
    lastSuccessAt: string | null;
    latencyMs: number | null;
    errorCode: string | null;
    message: string | null;
  };
}

const TYPE_BY_SOURCE: Record<string, SourceType> = {
  INMET: 'OFFICIAL_WEATHER',
  MOCK: 'DEMO',
};

export class SourceService {
  constructor(private readonly legacyHealth: LegacyHealthPort) {}

  listSources(): DataSource[] {
    const health = this.snapshot();
    const iso = nowIso();
    return [
      {
        id: health.id,
        name: health.name,
        type: health.type,
        createdAt: iso,
        updatedAt: iso,
      },
    ];
  }

  getHealth(): SourceHealth {
    return this.snapshot();
  }

  private snapshot(): SourceHealth {
    const legacy = this.legacyHealth.getSourceHealth();
    const iso = nowIso();
    return {
      id: legacy.source,
      name: sourceDisplayName(legacy.source),
      type: TYPE_BY_SOURCE[legacy.source] ?? 'OFFICIAL_WEATHER',
      status: legacy.status,
      lastAttemptAt: legacy.lastAttemptAt,
      lastSuccessAt: legacy.lastSuccessAt,
      latencyMs: legacy.latencyMs,
      errorCode: legacy.errorCode,
      message: legacy.message,
      createdAt: iso,
      updatedAt: iso,
    };
  }
}

function sourceDisplayName(source: string): string {
  switch (source) {
    case 'INMET':
      return 'Instituto Nacional de Meteorologia (INMET)';
    case 'MOCK':
      return 'Ambiente de demonstração (dados simulados)';
    default:
      return source;
  }
}
