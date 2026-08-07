'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { formatDate, getAlertTypeLabel } from '@/lib/utils';
import type { Alert } from '@/types/alert';

interface RecentAlertsListProps {
  alerts: Alert[];
}

export function RecentAlertsList({ alerts }: RecentAlertsListProps) {
  const recentAlerts = alerts.slice(0, 5);

  if (recentAlerts.length === 0) {
    return (
      <Card>
        <p className="text-sm text-hydro-text-secondary text-center py-4">
          Nenhum alerta recente. Dados simulados.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {recentAlerts.map((alert) => (
        <Link key={alert.id} href={`/alertas/${alert.id}`}>
          <Card className="mb-2 group">
            <div className="flex items-start gap-3">
              {/* Colored left indicator */}
              <div className={cn(
                'w-1 self-stretch rounded-full shrink-0',
                alert.severity >= 3 ? 'bg-hydro-danger' :
                alert.severity === 2 ? 'bg-hydro-orange' :
                alert.severity === 1 ? 'bg-hydro-warning' : 'bg-hydro-blue-500'
              )} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge severity={alert.severity}>
                    {getAlertTypeLabel(alert.type)}
                  </Badge>
                </div>
                <h4 className="text-sm font-semibold text-hydro-text truncate">
                  {alert.title}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-hydro-text-secondary truncate">
                    {alert.location}
                  </span>
                  <span className="text-xs text-hydro-border">|</span>
                  <span className="text-xs text-hydro-text-secondary whitespace-nowrap">
                    {formatDate(alert.startedAt)}
                  </span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-hydro-text-muted shrink-0 mt-1 group-hover:text-hydro-blue-500 transition-colors" />
            </div>
          </Card>
        </Link>
      ))}

      {alerts.length > 5 && (
        <Link
          href="/alertas"
          className="block text-center text-sm text-hydro-blue-600 hover:text-hydro-blue-700 font-medium py-2 transition-colors"
        >
          Ver todos os alertas →
        </Link>
      )}
    </div>
  );
}

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
