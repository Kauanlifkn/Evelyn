'use client';

import { useState } from 'react';
import {
  Clock,
  Share2,
  AlertTriangle,
  ExternalLink,
  CheckCircle,
  Phone,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { OfficialBadge } from './OfficialBadge';
import {
  formatDate,
  getSeverityLabel,
  getOfficialEventTypeLabel,
  getSourceLabel,
  getStatusBadgeSeverity,
  getStatusLabel,
} from '@/lib/utils';
import type { Alert } from '@/server/domain/alerts/alert.contract';

interface OfficialAlertDetailProps {
  alert: Alert;
}

// localStorage key for local-only "I am safe" confirmations (stored on
// this device only, never transmitted).
const SAFE_CONFIRMATIONS_KEY = 'hidro-alerta-safe-confirmations';

type ShareStatus = 'idle' | 'copied' | 'error' | 'unavailable';

const EMERGENCY_NUMBERS = [
  { phone: '192', label: 'SAMU — emergências médicas' },
  { phone: '193', label: 'Bombeiros — salvamento' },
  { phone: '199', label: 'Defesa Civil' },
  { phone: '190', label: 'Polícia Militar' },
];

/**
 * Alert detail for the domain contract (RECOVERY-2 — numeric severity,
 * doc §5 statuses). Renders official (INMET) and simulated alerts.
 */
export function OfficialAlertDetail({ alert }: OfficialAlertDetailProps) {
  const isCritical = alert.severity >= 2;

  const [shareStatus, setShareStatus] = useState<ShareStatus>('idle');
  const [safeConfirmed, setSafeConfirmed] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  async function handleShare() {
    const url = window.location.href;

    // 1) Async Clipboard API (secure contexts).
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(url);
        setShareStatus('copied');
        return;
      } catch {
        // Permission denied or write failed — fall through to the
        // legacy fallback below. Never claim success here.
      }
    }

    // 2) Legacy fallback (deprecated execCommand — only used when the
    // async API is unavailable or rejected).
    try {
      const textarea = document.createElement('textarea');
      textarea.value = url;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const copied = document.execCommand('copy');
      document.body.removeChild(textarea);
      setShareStatus(copied ? 'copied' : 'error');
    } catch {
      setShareStatus('unavailable');
    }
  }

  function handleSafeConfirm() {
    // LOCAL ONLY — stored on this device, explicitly not sent anywhere.
    try {
      const raw = window.localStorage.getItem(SAFE_CONFIRMATIONS_KEY);
      const list = raw ? (JSON.parse(raw) as Record<string, string>) : {};
      list[alert.id] = new Date().toISOString();
      window.localStorage.setItem(SAFE_CONFIRMATIONS_KEY, JSON.stringify(list));
    } catch {
      // localStorage unavailable — the in-page confirmation still stands.
    }
    setSafeConfirmed(true);
  }

  const shareMessage: Record<Exclude<ShareStatus, 'idle'>, string> = {
    copied: 'Link copiado para a área de transferência.',
    error:
      'Não foi possível copiar automaticamente. Copie o endereço da barra do navegador.',
    unavailable: 'Compartilhamento automático indisponível neste navegador.',
  };

  return (
    <div className="space-y-6">
      {/* Critical alert banner */}
      {isCritical && (
        <div className="bg-hydro-gradient-emergency text-white text-sm px-5 py-4 rounded-2xl flex items-center gap-3 shadow-hydro">
          <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-bold">
              {alert.isOfficial ? 'ALERTA CRÍTICO' : 'ALERTA CRÍTICO (SIMULADO)'}
            </p>
            <p className="text-white/90 text-xs mt-0.5">
              {alert.isOfficial
                ? 'Este alerta requer atenção imediata. Fonte oficial.'
                : 'Este alerta é simulado — ambiente de demonstração.'}
            </p>
          </div>
        </div>
      )}

      {/* Source notice */}
      {alert.isOfficial ? (
        <div className="bg-hydro-safe-soft text-hydro-safe-dark text-sm px-4 py-3 rounded-xl flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="font-medium">ALERTA OFICIAL</span>
          <span className="text-hydro-text-secondary" aria-hidden="true">—</span>
          <span className="text-hydro-text-secondary">
            Fonte: {getSourceLabel(alert.source)}
          </span>
        </div>
      ) : (
        <div className="bg-hydro-warning-soft text-hydro-warning-dark text-sm px-4 py-3 rounded-xl flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="font-medium">DADOS SIMULADOS</span>
          <span className="text-hydro-text-secondary" aria-hidden="true">—</span>
          <span className="text-hydro-text-secondary">
            este alerta não é real (fonte: {getSourceLabel(alert.source)})
          </span>
        </div>
      )}

      {/* Title and badges */}
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge severity={alert.severity} className="text-sm px-3 py-1">
            {getOfficialEventTypeLabel(alert.eventType)}
          </Badge>
          <Badge
            severity={getStatusBadgeSeverity(alert.status)}
            className="text-sm px-3 py-1"
          >
            {getStatusLabel(alert.status)}
          </Badge>
          {alert.isOfficial && <OfficialBadge source={alert.source} size="md" />}
        </div>
        <h1 className="text-xl font-bold text-hydro-text">{alert.title}</h1>
      </div>

      {/* Description */}
      <Card>
        <h2 className="text-xs text-hydro-text-secondary uppercase tracking-wide mb-2 font-medium">Descrição</h2>
        <p className="text-sm text-hydro-text-secondary leading-relaxed">{alert.description}</p>
      </Card>

      {/* Details grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-hydro-text-secondary uppercase tracking-wide mb-1 font-medium">Fonte</p>
              <p className="text-sm font-medium text-hydro-text">{getSourceLabel(alert.source)}</p>
            </div>
            <div>
              <p className="text-xs text-hydro-text-secondary uppercase tracking-wide mb-1 font-medium">Evento</p>
              <p className="text-sm font-medium text-hydro-text">
                {getOfficialEventTypeLabel(alert.eventType)}
              </p>
            </div>
            <div>
              <p className="text-xs text-hydro-text-secondary uppercase tracking-wide mb-1 font-medium">Severidade</p>
              <p className="text-sm font-medium text-hydro-text">
                {getSeverityLabel(alert.severity)}
              </p>
              <p className="text-xs text-hydro-text-secondary">Original: {alert.originalSeverity}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-hydro-text-secondary uppercase tracking-wide mb-1 font-medium">Status</p>
              <Badge severity={getStatusBadgeSeverity(alert.status)}>
                {getStatusLabel(alert.status)}
              </Badge>
            </div>
            {alert.effectiveAt && (
              <div>
                <p className="text-xs text-hydro-text-secondary uppercase tracking-wide mb-1 font-medium">Válido desde</p>
                <p className="text-sm font-medium text-hydro-text flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  {formatDate(alert.effectiveAt)}
                </p>
              </div>
            )}
            {alert.expiresAt && (
              <div>
                <p className="text-xs text-hydro-text-secondary uppercase tracking-wide mb-1 font-medium">Válido até</p>
                <p className="text-sm font-medium text-hydro-text flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  {formatDate(alert.expiresAt)}
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Instructions (when the source provides them) */}
      {alert.instruction && (
        <Card>
          <h2 className="text-xs text-hydro-text-secondary uppercase tracking-wide mb-2 font-medium">
            Orientações da fonte
          </h2>
          <p className="text-sm text-hydro-text-secondary leading-relaxed">{alert.instruction}</p>
        </Card>
      )}

      {/* Affected areas */}
      {alert.areas.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-hydro-text mb-2">
            Áreas Afetadas
          </h2>
          <Card>
            <p className="text-xs text-hydro-text-secondary mb-3">
              {alert.areas.length} {alert.areas.length === 1 ? 'região' : 'regiões'} afetada{alert.areas.length === 1 ? '' : 's'}.
              {alert.isOfficial
                ? ' Coordenadas geográficas não fornecidas pela fonte.'
                : ''}
            </p>
            <div className="flex flex-wrap gap-2">
              {alert.areas.map((area, i) => (
                <span
                  key={`${area.areaDesc}-${i}`}
                  className="inline-flex items-center rounded-xl bg-hydro-surface-blue px-3 py-1.5 text-xs font-medium text-hydro-text"
                >
                  {area.areaDesc}
                </span>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Citizen actions */}
      <div className="flex flex-wrap gap-3 pt-2 border-t border-hydro-border">
        <Button variant="outline" onClick={handleSafeConfirm}>
          <CheckCircle className="h-4 w-4" aria-hidden="true" />
          {safeConfirmed ? 'Segurança registrada (LOCAL)' : 'Estou seguro'}
        </Button>
        <Button variant="danger" onClick={() => setHelpOpen(true)}>
          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          Preciso de ajuda
        </Button>
        <Button variant="outline" onClick={handleShare}>
          <Share2 className="h-4 w-4" aria-hidden="true" />
          Compartilhar
        </Button>
        {alert.sourceUrl && (
          <Button
            variant="outline"
            onClick={() => { window.open(alert.sourceUrl, '_blank', 'noopener'); }}
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            Ver na fonte
          </Button>
        )}
      </div>

      {/* Honest action feedback (live region) */}
      <div aria-live="polite">
        {shareStatus !== 'idle' && (
          <p
            role="status"
            className={`text-sm px-4 py-2.5 rounded-xl ${
              shareStatus === 'copied'
                ? 'bg-hydro-safe-soft text-hydro-safe-dark'
                : 'bg-hydro-warning-soft text-hydro-warning-dark'
            }`}
          >
            {shareMessage[shareStatus]}
          </p>
        )}
        {safeConfirmed && (
          <p
            role="status"
            className="mt-2 text-sm px-4 py-2.5 rounded-xl bg-hydro-surface-blue text-hydro-text-secondary"
          >
            Confirmação registrada apenas neste dispositivo (LOCAL) — não é
            enviada a nenhum órgão. O envio digital ainda não está conectado.
          </p>
        )}
      </div>

      {/* Help modal with official emergency channels */}
      <Modal open={helpOpen} onClose={() => setHelpOpen(false)} title="Preciso de ajuda">
        <div className="space-y-4">
          <p className="text-sm text-hydro-text-secondary">
            O envio digital de pedidos de ajuda <strong className="text-hydro-text">ainda não está conectado</strong> a
            nenhum órgão público. Em uma emergência real, ligue diretamente:
          </p>
          <ul className="space-y-2">
            {EMERGENCY_NUMBERS.map(({ phone, label }) => (
              <li key={phone}>
                <a
                  href={`tel:${phone}`}
                  className="flex items-center gap-3 rounded-xl border border-hydro-border px-4 py-3 hover:bg-hydro-surface-blue transition-colors"
                >
                  <Phone className="h-4 w-4 text-hydro-danger shrink-0" aria-hidden="true" />
                  <span className="text-lg font-bold text-hydro-text">{phone}</span>
                  <span className="text-sm text-hydro-text-secondary">{label}</span>
                </a>
              </li>
            ))}
          </ul>
          <p className="text-xs text-hydro-text-secondary">
            Se houver risco à vida, não aguarde: ligue imediatamente.
            {alert.isOfficial
              ? ` Este aviso é da fonte oficial ${getSourceLabel(alert.source)}.`
              : ' Este alerta é simulado (ambiente de demonstração).'}
          </p>
        </div>
      </Modal>

      {/* Source footer */}
      <div className="text-center text-xs text-hydro-text-secondary pb-4">
        {alert.isOfficial ? 'Alerta oficial' : 'Alerta simulado'} —{' '}
        {getSourceLabel(alert.source)}
        {alert.fetchedAt && (
          <span>
            {' '}· Sincronizado em{' '}
            {new Date(alert.fetchedAt).toLocaleString('pt-BR')}
          </span>
        )}
      </div>
    </div>
  );
}
