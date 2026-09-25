/**
 * cn - Conditionally join class names, filtering out falsy values.
 */
export function cn(
  ...classes: (string | undefined | null | false)[]
): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * formatDate - Format an ISO date string to Brazilian format "DD/MM/YYYY HH:mm".
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

/**
 * formatDistance - Format a distance value with "km" suffix.
 */
export function formatDistance(km: number): string {
  return `${km.toFixed(1)} km`;
}

/**
 * getSeverityLabel - Return the Portuguese label for a severity level (0-4).
 */
export function getSeverityLabel(severity: number): string {
  switch (severity) {
    case 0:
      return 'Informativo';
    case 1:
      return 'Atenção';
    case 2:
      return 'Perigo';
    case 3:
      return 'Perigo Extremo';
    case 4:
      return 'Emergência';
    default:
      return 'Desconhecido';
  }
}

/**
 * getSeverityColor - Return a text-color class for a severity level.
 */
export function getSeverityColor(severity: number): string {
  switch (severity) {
    case 0:
      return 'text-hydro-blue-500';
    case 1:
      return 'text-hydro-warning';
    case 2:
      return 'text-hydro-orange';
    case 3:
      return 'text-hydro-danger';
    case 4:
      return 'text-hydro-purple';
    default:
      return 'text-hydro-text-secondary';
  }
}

/**
 * getOriginLabel - Return the Portuguese label for an alert origin.
 */
export function getOriginLabel(origin: string): string {
  switch (origin) {
    case 'OFFICIAL':
      return 'Oficial';
    case 'SENSOR':
      return 'Sensor';
    case 'MODEL':
      return 'Modelo';
    case 'OPERATOR':
      return 'Operador';
    case 'COMMUNITY':
      return 'Comunidade';
    case 'PARTNER':
      return 'Parceiro';
    default:
      return origin;
  }
}

/**
 * getStatusLabel - Return the Portuguese label for an alert or incident status.
 */
export function getStatusLabel(status: string): string {
  switch (status) {
    case 'draft':
      return 'Rascunho';
    case 'validating':
      return 'Validando';
    case 'active':
      return 'Ativo';
    case 'updated':
      return 'Atualizado';
    case 'closed':
      return 'Encerrado';
    case 'cancelled':
      return 'Cancelado';
    case 'false_positive':
      return 'Falso Positivo';
    case 'pending':
      return 'Pendente';
    case 'confirmed':
      return 'Confirmado';
    case 'rejected':
      return 'Rejeitado';
    default:
      return status;
  }
}

/**
 * getAlertTypeLabel - Return the Portuguese label for an alert type.
 */
export function getAlertTypeLabel(type: string): string {
  switch (type) {
    case 'flood':
      return 'Inundação';
    case 'waterlogging':
      return 'Alagamento';
    case 'river_flood':
      return 'Enchente';
    case 'flash_flood':
      return 'Enchente Rápida';
    case 'landslide':
      return 'Deslizamento';
    case 'dam_risk':
      return 'Risco de Barragem';
    case 'heavy_rain':
      return 'Chuva Intensa';
    case 'coastal_surge':
      return 'Resaca Costeira';
    case 'tsunami':
      return 'Tsunami';
    case 'storm_surge':
      return 'Mare de Tempestade';
    case 'high_waves':
      return 'Ondas Altas';
    default:
      return type;
  }
}

/**
 * getShelterStatusLabel - Return the Portuguese label for a shelter status.
 */
export function getShelterStatusLabel(status: string): string {
  switch (status) {
    case 'open':
      return 'Aberto';
    case 'crowded':
      return 'Lotado';
    case 'closed':
      return 'Fechado';
    case 'unknown':
      return 'Desconhecido';
    default:
      return status;
  }
}

/**
 * getShelterStatusColor - Return bg/text classes for a shelter status.
 */
export function getShelterStatusColor(status: string): { bg: string; text: string } {
  switch (status) {
    case 'open':
      // safe-dark: AA contrast for text on the soft teal background.
      return { bg: 'bg-hydro-safe-soft', text: 'text-hydro-safe-dark' };
    case 'crowded':
      // danger-dark-text: AA contrast on the soft red background.
      return { bg: 'bg-hydro-danger-soft', text: 'text-hydro-danger-dark-text' };
    case 'closed':
      return { bg: 'bg-hydro-surface-blue', text: 'text-hydro-text-secondary' };
    default:
      return { bg: 'bg-hydro-surface-blue', text: 'text-hydro-text-secondary' };
  }
}

/**
 * getStatusBadgeSeverity - Map an alert/incident status to a badge severity number.
 */
export function getStatusBadgeSeverity(status: string): number {
  switch (status) {
    case 'active':
      return 2;
    case 'updated':
      return 1;
    case 'validating':
      return 1;
    case 'draft':
      return 0;
    case 'closed':
      return 0;
    case 'cancelled':
      return 0;
    case 'false_positive':
      return 0;
    case 'confirmed':
      return 2;
    case 'pending':
      return 1;
    case 'rejected':
      return 3;
    default:
      return 0;
  }
}

/**
 * getIncidentTypeLabel - Return the Portuguese label for an incident type.
 */
/**
 * getOfficialSeverityLabel - Return the Portuguese label for an official alert severity.
 */
export function getOfficialSeverityLabel(severity: string): string {
  switch (severity) {
    case 'informative':
      return 'Informativo';
    case 'attention':
      return 'Atenção';
    case 'danger':
      return 'Perigo';
    case 'extreme':
      return 'Perigo Extremo';
    default:
      return 'Desconhecido';
  }
}

/**
 * getOfficialSeverityNumber - Map official severity to numeric (0-3) for Badge component.
 */
export function getOfficialSeverityNumber(severity: string): number {
  switch (severity) {
    case 'informative':
      return 0;
    case 'attention':
      return 1;
    case 'danger':
      return 2;
    case 'extreme':
      return 3;
    default:
      return 0;
  }
}

/**
 * getOfficialSeverityBg - Return background class for official alert severity.
 */
export function getOfficialSeverityBg(severity: string): string {
  switch (severity) {
    case 'informative':
      return 'bg-hydro-blue-500';
    case 'attention':
      return 'bg-hydro-warning';
    case 'danger':
      return 'bg-hydro-orange';
    case 'extreme':
      return 'bg-hydro-danger';
    default:
      return 'bg-hydro-blue-500';
  }
}

/**
 * getSeverityBadgeBg - Background indicator class for the numeric
 * domain severity (0–4, RECOVERY-2 contract).
 */
export function getSeverityBadgeBg(severity: number): string {
  switch (severity) {
    case 0:
      return 'bg-hydro-blue-500';
    case 1:
      return 'bg-hydro-warning';
    case 2:
      return 'bg-hydro-orange';
    case 3:
      return 'bg-hydro-danger';
    case 4:
      return 'bg-hydro-purple';
    default:
      return 'bg-hydro-blue-500';
  }
}

/**
 * getSourceLabel - Return display label for alert source.
 */
export function getSourceLabel(source: string): string {
  switch (source) {
    case 'INMET':
      return 'Instituto Nacional de Meteorologia';
    case 'MOCK':
      return 'Demonstração';
    default:
      return source;
  }
}

/**
 * getOfficialEventTypeLabel - Return the Portuguese label for an event type
 * coming from the official (INMET) pipeline, falling back to the shared
 * alert type labels.
 */
export function getOfficialEventTypeLabel(eventType: string): string {
  switch (eventType) {
    case 'heavy_rain':
      return 'Chuvas Intensas';
    case 'storm':
      return 'Tempestade';
    case 'frost':
      return 'Geada';
    case 'low_humidity':
      return 'Baixa Umidade';
    case 'rain_accumulation':
      return 'Acumulado de Chuva';
    case 'coastal_winds':
      return 'Ventos Costeiros';
    case 'gale':
      return 'Vendaval';
    case 'temperature_drop':
      return 'Declínio de Temperatura';
    case 'heat':
      return 'Onda de Calor';
    default:
      return getAlertTypeLabel(eventType);
  }
}

/**
 * telHref - Build a tel: link from a display phone string.
 * Returns null when the string does not contain a dialable number.
 */
export function telHref(phone: string): string | null {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 8) return null;
  return `tel:+55${digits}`;
}

/**
 * getIncidentTypeLabel - Return the Portuguese label for an incident type.
 */
export function getIncidentTypeLabel(type: string): string {
  switch (type) {
    case 'waterlogging':
      return 'Alagamento';
    case 'flood':
      return 'Inundação';
    case 'landslide':
      return 'Deslizamento';
    case 'blocked_road':
      return 'Via Bloqueada';
    case 'person_at_risk':
      return 'Pessoa em Risco';
    default:
      return type;
  }
}
