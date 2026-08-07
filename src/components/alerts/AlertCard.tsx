'use client';

import Link from 'next/link';
import { MapPin, Clock, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import {
  formatDate,
  getAlertTypeLabel,
  getOriginLabel,
  getStatusBadgeSeverity,
  getStatusLabel,
} from '@/lib/utils';
import type { Alert } from '@/types/alert';

interface AlertCardProps {
  alert: Alert;
}

export function AlertCard({ alert }: AlertCardProps) {
  return (
    <Link href={`/alertas/${alert.id}`}>
      <Card className="group">
        <div className="flex items-start gap-3">
          {/* Colored left indicator */}
          <div className={`w-1 self-stretch rounded-full shrink-0 ${
            alert.severity >= 3 ? 'bg-hydro-danger' :
            alert.severity === 2 ? 'bg-hydro-orange' :
            alert.severity === 1 ? 'bg-hydro-warning' : 'bg-hydro-blue-500'
          }`} />

          <div className="flex-1 min-w-0">
            {/* Header row */}
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <Badge severity={alert.severity}>{getAlertTypeLabel(alert.type)}</Badge>
              <Badge severity={getStatusBadgeSeverity(alert.status)}>
                {getStatusLabel(alert.status)}
              </Badge>
            </div>

            {/* Title */}
            <h3 className="text-sm font-semibold text-hydro-text">{alert.title}</h3>

            {/* Location, origin, time */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-hydro-text-secondary mt-1">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {alert.location}
              </span>
              <span className="text-hydro-border">|</span>
              <span>Origem: {getOriginLabel(alert.origin)}</span>
              <span className="text-hydro-border">|</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDate(alert.startedAt)}
              </span>
            </div>
          </div>

          <ChevronRight className="h-4 w-4 text-hydro-text-muted shrink-0 mt-2 group-hover:text-hydro-blue-500 transition-colors" />
        </div>
      </Card>
    </Link>
  );
}
