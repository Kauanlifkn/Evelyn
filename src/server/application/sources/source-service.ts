/**
 * Source application service (RECOVERY-3).
 * Health snapshot is now ASYNC: in postgres mode it reads source_health;
 * in memory mode it wraps the legacy provider read-model.
 */

import type {
  DataSource,
  SourceHealth,
  SourceStatus,
  SourceType,
} from '@/server/domain/sources/sources.contract';
import { nowIso } from '@/server/shared/time';

export interface SourceSnapshot {
  id: string;
  name: string;
  type: SourceType;
  status: SourceStatus;
  lastAttemptAt: string | null;
  lastSuccessAt: string | null;
  latencyMs: number | null;
  errorCode: string | null;
  message: string | null;
}

export interface SourceSnapshotPort {
  getHealthSnapshot(): Promise<SourceSnapshot>;
}

/** Legacy read-model do provider (memória / warm-up). */
export interface LegacyHealthPort {
  getSourceHealth(): {
    source: string;
    status: SourceStatus;
    lastAttemptAt: string | null;
    lastSuccessAt: string | null;
    latencyMs: number | null;
    errorCode: string | null;
    message: string | null;
  };
}

export class SourceService {
  constructor(private readonly snapshotPort: SourceSnapshotPort) {}

  async listSources(): Promise<DataSource[]> {
    const snapshot = await this.snapshotPort.getHealthSnapshot();
    const iso = nowIso();
    return [
      {
        id: snapshot.id,
        name: snapshot.name,
        type: snapshot.type,
        createdAt: iso,
        updatedAt: iso,
      },
    ];
  }

  async getHealth(): Promise<SourceHealth> {
    const snapshot = await this.snapshotPort.getHealthSnapshot();
    return {
      id: snapshot.id,
      name: snapshot.name,
      type: snapshot.type,
      status: snapshot.status,
      lastAttemptAt: snapshot.lastAttemptAt,
      lastSuccessAt: snapshot.lastSuccessAt,
      latencyMs: snapshot.latencyMs,
      errorCode: snapshot.errorCode,
      message: snapshot.message,
      createdAt: snapshot.lastAttemptAt ?? nowIso(),
      updatedAt: nowIso(),
    };
  }
}

export function sourceDisplayName(source: string): string {
  switch (source) {
    case 'INMET':
      return 'Instituto Nacional de Meteorologia (INMET)';
    case 'MOCK':
      return 'Ambiente de demonstração (dados simulados)';
    default:
      return source;
  }
}
