'use client';

import Link from 'next/link';
import { Clock, ChevronRight, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { OfficialBadge } from './OfficialBadge';
import {
  cn,
  formatDate,
  getOfficialEventTypeLabel,
  getSeverityBadgeBg,
  getStatusBadgeSeverity,
  getStatusLabel,
} from '@/lib/utils';
import type { Alert } from '@/server/domain/alerts/alert.contract';

interface OfficialAlertCardProps {
  alert: Alert;
}

/**
 * Alert card for the domain contract (RECOVERY-2 — numeric severity 0–4,
 * status per doc §5). Renders both official (INMET) and simulated alerts;
 * only official ones receive the OFICIAL badge (isOfficial flag).
 */
export function OfficialAlertCard({ alert }: OfficialAlertCardProps) {
  const severityBg = getSeverityBadgeBg(alert.severity);

  return (
    <Link href={`/alertas/${alert.id}`}>
      <Card className="group">
        <div className="flex items-start gap-3">
          {/* Colored left indicator */}
          <div className={cn('w-1 self-stretch rounded-full shrink-0', severityBg)} />

          <div className="flex-1 min-w-0">
            {/* Header row */}
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <Badge severity={alert.severity}>
                {getOfficialEventTypeLabel(alert.eventType)}
              </Badge>
              <Badge severity={getStatusBadgeSeverity(alert.status)}>
                {getStatusLabel(alert.status)}
              </Badge>
              {alert.isOfficial && (
                <OfficialBadge source={alert.source} size="sm" />
              )}
            </div>

            {/* Title */}
            <h3 className="text-sm font-semibold text-hydro-text">
              {alert.title}
            </h3>

            {/* Areas, time */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-hydro-text-secondary mt-1">
              {alert.areas.length > 0 && (
                <span className="flex items-center gap-1 truncate max-w-[200px]">
                  <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
                  {alert.areas[0].areaDesc}
                  {alert.areas.length > 1 && ` +${alert.areas.length - 1}`}
                </span>
              )}
              {alert.areas.length > 0 && (
                <span className="text-hydro-border" aria-hidden="true">|</span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" aria-hidden="true" />
                {alert.effectiveAt ? formatDate(alert.effectiveAt) : '—'}
              </span>
            </div>
          </div>

          <ChevronRight
            className="h-4 w-4 text-hydro-text-muted shrink-0 mt-2 group-hover:text-hydro-blue-500 transition-colors"
            aria-hidden="true"
          />
        </div>
      </Card>
    </Link>
  );
}
