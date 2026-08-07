'use client';

import {
  MapPin,
  Clock,
  Share2,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  formatDate,
  getAlertTypeLabel,
  getOriginLabel,
  getStatusLabel,
  getStatusBadgeSeverity,
} from '@/lib/utils';
import type { Alert } from '@/types/alert';

interface AlertDetailProps {
  alert: Alert;
}

export function AlertDetail({ alert: alertData }: AlertDetailProps) {
  const isCritical = alertData.severity >= 3;

  return (
    <div className="space-y-6">
      {/* Critical alert banner */}
      {isCritical && (
        <div className="bg-hydro-gradient-emergency text-white text-sm px-5 py-4 rounded-2xl flex items-center gap-3 shadow-hydro">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-bold">ALERTA CRÍTICO</p>
            <p className="text-white/90 text-xs mt-0.5">
              Este alerta requer atenção imediata. Dados simulados.
            </p>
          </div>
        </div>
      )}

      {/* Simulated data notice (non-critical) */}
      {!isCritical && (
        <div className="bg-hydro-navy-950 text-hydro-text-on-dark text-sm px-4 py-3 rounded-xl flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-hydro-warning" />
          <span className="text-hydro-text-on-dark/90">DADOS SIMULADOS - Este alerta não é real. Ambiente de demonstração.</span>
        </div>
      )}

      {/* Title and badges */}
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge severity={alertData.severity} className="text-sm px-3 py-1">
            {getAlertTypeLabel(alertData.type)}
          </Badge>
          <Badge severity={getStatusBadgeSeverity(alertData.status)} className="text-sm px-3 py-1">
            {getStatusLabel(alertData.status)}
          </Badge>
          {alertData.isSimulated && (
            <span className="text-xs text-hydro-text-secondary italic">Simulado</span>
          )}
        </div>
        <h1 className="text-xl font-bold text-hydro-text">{alertData.title}</h1>
      </div>

      {/* Description */}
      <Card>
        <p className="text-sm text-hydro-text-secondary leading-relaxed">{alertData.description}</p>
      </Card>

      {/* Details grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-hydro-text-secondary uppercase tracking-wide mb-1 font-medium">Tipo</p>
              <p className="text-sm font-medium text-hydro-text">
                {getAlertTypeLabel(alertData.type)}
              </p>
            </div>
            <div>
              <p className="text-xs text-hydro-text-secondary uppercase tracking-wide mb-1 font-medium">Localização</p>
              <p className="text-sm font-medium text-hydro-text flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {alertData.location} - {alertData.city}/{alertData.state}
              </p>
            </div>
            <div>
              <p className="text-xs text-hydro-text-secondary uppercase tracking-wide mb-1 font-medium">Origem</p>
              <p className="text-sm font-medium text-hydro-text">
                {getOriginLabel(alertData.origin)}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-hydro-text-secondary uppercase tracking-wide mb-1 font-medium">Status</p>
              <Badge severity={getStatusBadgeSeverity(alertData.status)}>
                {getStatusLabel(alertData.status)}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-hydro-text-secondary uppercase tracking-wide mb-1 font-medium">Início</p>
              <p className="text-sm font-medium text-hydro-text flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {formatDate(alertData.startedAt)}
              </p>
            </div>
            <div>
              <p className="text-xs text-hydro-text-secondary uppercase tracking-wide mb-1 font-medium">Válido até</p>
              <p className="text-sm font-medium text-hydro-text flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {formatDate(alertData.validUntil)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Source */}
      <div className="text-xs text-hydro-text-secondary">
        Fonte: {alertData.source}
      </div>

      {/* Instructions */}
      <div>
        <h2 className="text-sm font-semibold text-hydro-text mb-2">
          Orientações
        </h2>
        <Card>
          <ul className="space-y-2">
            {alertData.instructions.map((instruction, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-hydro-text-secondary">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-hydro-blue-soft text-hydro-blue-700 text-xs font-bold shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {instruction}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Affected areas */}
      {alertData.affectedAreas.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-hydro-text mb-2">
            Áreas Afetadas
          </h2>
          <div className="flex flex-wrap gap-2">
            {alertData.affectedAreas.map((area) => (
              <span
                key={area}
                className="inline-flex items-center rounded-xl bg-hydro-surface-blue px-3 py-1.5 text-xs font-medium text-hydro-text"
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3 pt-2 border-t border-hydro-border">
        <Button
          variant="primary"
          onClick={() => alert('Simulado: Registro de "Estou seguro" enviado.')}
        >
          <CheckCircle className="h-4 w-4" />
          Estou seguro
        </Button>
        <Button
          variant="danger"
          onClick={() => alert('Simulado: Pedido de ajuda enviado.')}
        >
          <AlertTriangle className="h-4 w-4" />
          Preciso de ajuda
        </Button>
        <Button
          variant="outline"
          onClick={() => alert('Simulado: Link copiado para compartilhamento.')}
        >
          <Share2 className="h-4 w-4" />
          Compartilhar
        </Button>
      </div>

      {/* Simulated notice footer */}
      <div className="text-center text-xs text-hydro-text-secondary italic pb-4">
        Este alerta faz parte de um ambiente de demonstração com dados simulados.
      </div>
    </div>
  );
}
