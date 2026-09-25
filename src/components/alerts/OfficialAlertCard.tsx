'use client';

import Link from 'next/link';
import { Clock, ChevronRight, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { OfficialBadge } from './OfficialBadge';
import {
  formatDate,
  getOfficialSeverityNumber,
  getOfficialSeverityBg,
  getOfficialEventTypeLabel,
} from '@/lib/utils';
import type { OfficialAlert } from '@/server/providers/alerts/types';

interface OfficialAlertCardProps {
  alert: OfficialAlert;
}

export function OfficialAlertCard({ alert }: OfficialAlertCardProps) {
  const severityNum = getOfficialSeverityNumber(alert.severity);
  const severityBg = getOfficialSeverityBg(alert.severity);

  return (
    <Link href={`/alertas/${alert.id}`}>      <Card className="group">
        <div className="flex items-start gap-3">
          {/* Colored left indicator */}
          <div
            className={`w-1 self-stretch rounded-full shrink-0 ${severityBg}`}
          />

          <div className="flex-1 min-w-0">
            {/* Header row */}
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <Badge severity={severityNum}>
                {getOfficialEventTypeLabel(alert.eventType)}
              </Badge>
              <Badge severity={alert.status === 'active' ? 2 : 0}>
                {alert.status === 'active' ? 'Ativo' : 'Expirado'}
              </Badge>
              {alert.isOfficial && (
                <OfficialBadge
                  source={alert.source}
                  size="sm"
                />
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
                  <MapPin className="h-3 w-3 shrink-0" />
                  {alert.areas[0].areaDesc}
                  {alert.areas.length > 1 &&
                    ` +${alert.areas.length - 1}`}
                </span>
              )}
              {alert.areas.length > 0 && (
                <span className="text-hydro-border">|</span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {alert.effectiveAt
                  ? formatDate(alert.effectiveAt)
                  : '—'}
              </span>
            </div>
          </div>

          <ChevronRight className="h-4 w-4 text-hydro-text-muted shrink-0 mt-2 group-hover:text-hydro-blue-500 transition-colors" />
        </div>
      </Card>
    </Link>
  );
}
