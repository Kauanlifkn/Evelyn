/**
 * Alert application service (RECOVERY-2).
 *
 * Route Handlers depend on this service; the service depends on the
 * AlertSourcePort (INMET adapter, mock adapter, future IDAP). No RSS
 * parsing and no provider imports above this line.
 */

import type {
  Alert,
  AlertFilter,
  AlertSourcePort,
} from '@/server/domain/alerts/alert.contract';
import { AppError } from '@/server/shared/errors/app-error';
import {
  DEFAULT_PAGE_SIZE,
  type PageMeta,
  type PaginationQuery,
} from '@/server/shared/pagination';

export interface AlertListResult {
  items: Alert[];
  meta: PageMeta;
}

export class AlertService {
  constructor(private readonly source: AlertSourcePort) {}

  async list(
    filter: AlertFilter = {},
    pagination: PaginationQuery = { page: 1, pageSize: DEFAULT_PAGE_SIZE }
  ): Promise<AlertListResult> {
    const all = await this.source.fetchAlerts();
    const filtered = all.filter((a) => matchesFilter(a, filter));

    // Most severe first, then most recent — the "most important alert"
    // concept of doc §6.1 without pretending to be a risk engine.
    filtered.sort((a, b) => {
      if (b.severity !== a.severity) return b.severity - a.severity;
      const ta = a.effectiveAt ?? a.createdAt;
      const tb = b.effectiveAt ?? b.createdAt;
      return tb.localeCompare(ta);
    });

    const total = filtered.length;
    const start = (pagination.page - 1) * pagination.pageSize;
    const items = filtered.slice(start, start + pagination.pageSize);

    return {
      items,
      meta: {
        page: pagination.page,
        pageSize: pagination.pageSize,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / pagination.pageSize),
      },
    };
  }

  async getById(id: string): Promise<Alert> {
    const all = await this.source.fetchAlerts();
    // Match by persisted UUID **or** external_id — legacy deep-links
    // (e.g. notification mocks "/alertas/alert-001") keep working against
    // the source's external identifier.
    const alert = all.find((a) => a.id === id || a.externalId === id);
    if (!alert) {
      throw AppError.notFound('Alerta não encontrado.', { alertId: id });
    }
    return alert;
  }
}

export function isActiveAlert(alert: Alert, now: Date = new Date()): boolean {
  if (alert.status !== 'active') return false;
  if (!alert.expiresAt) return true;
  return new Date(alert.expiresAt).getTime() > now.getTime();
}

function matchesFilter(alert: Alert, filter: AlertFilter): boolean {
  if (filter.source && alert.source.toLowerCase() !== filter.source.toLowerCase())
    return false;
  if (filter.severity !== undefined && alert.severity !== filter.severity)
    return false;
  if (filter.eventType && alert.eventType !== filter.eventType) return false;
  if (filter.status && alert.status !== filter.status) return false;
  if (
    filter.official !== undefined &&
    alert.isOfficial !== (filter.official === 'true')
  )
    return false;
  if (
    filter.active !== undefined &&
    isActiveAlert(alert) !== (filter.active === 'true')
  )
    return false;
  return true;
}
