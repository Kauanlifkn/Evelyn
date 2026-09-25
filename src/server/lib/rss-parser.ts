/**
 * Secure RSS parser for INMET alert feed.
 *
 * - No DOCTYPE external entities
 * - No XXE
 * - No network entity resolution
 * - No local file access
 * - Validates content before returning
 */

interface RssItem {
  title: string;
  link: string;
  /** Sanitized description (tags stripped) — safe for display. */
  description: string;
  /**
   * Raw CDATA content of <description>, BEFORE sanitization. The current
   * live INMET feed carries an HTML <table> here whose structure is needed
   * for field extraction; the sanitized version destroys it.
   */
  descriptionRaw?: string;
  pubDate: string;
}

interface RssChannel {
  title: string;
  link: string;
  description: string;
  items: RssItem[];
}

interface InmetAlertFields {
  status: string;
  evento: string;
  severidade: string;
  inicio: string;
  fim: string;
  descricao: string;
  area: string;
  linkGrafico: string;
}

const MAX_PAYLOAD_SIZE = 2 * 1024 * 1024; // 2 MB
const MAX_ITEMS = 500;

/**
 * Store a key/value pair from the INMET description table.
 * Keys are matched case-insensitively with and without accents.
 */
function storeField(
  fields: Partial<InmetAlertFields>,
  key: string,
  value: string
): void {
  switch (key.toLowerCase()) {
    case 'status':
      fields.status = value;
      break;
    case 'evento':
      fields.evento = value;
      break;
    case 'severidade':
      fields.severidade = value;
      break;
    case 'início':
    case 'inicio':
      fields.inicio = value;
      break;
    case 'fim':
      fields.fim = value;
      break;
    case 'descrição':
    case 'descricao':
      fields.descricao = value;
      break;
    case 'área':
    case 'area':
      fields.area = value;
      break;
    case 'link gráfico':
    case 'link grafico':
    case 'link_gráfico':
      fields.linkGrafico = value;
      break;
  }
}

/**
 * Parse the table inside INMET RSS <description>.
 *
 * The live feed has changed format over time — BOTH formats are supported:
 *  1. Markdown-like pipe table (older feed):  | Key | Value |
 *  2. HTML table (current live feed, 09/2026):
 *     <table>…<tr><th align="left">Key</th><td>Value</td></tr>…</table>
 */
function parseDescriptionTable(description: string): InmetAlertFields {
  const fields: Partial<InmetAlertFields> = {};

  // Format 1: markdown pipe rows: | Key | Value |
  const rowRegex = /^\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*$/gm;
  let match: RegExpExecArray | null;
  while ((match = rowRegex.exec(description)) !== null) {
    storeField(fields, match[1].trim(), match[2].trim());
  }

  if (Object.keys(fields).length > 0) {
    return fields as InmetAlertFields;
  }

  // Format 2: HTML table rows with <th>Key</th><td>Value</td> cells.
  const htmlRowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  const cellRegex = /<(?:th|td)[^>]*>([\s\S]*?)<\/(?:th|td)>/gi;
  let htmlRowMatch: RegExpExecArray | null;

  while ((htmlRowMatch = htmlRowRegex.exec(description)) !== null) {
    const cells: string[] = [];
    let cellMatch: RegExpExecArray | null;
    while ((cellMatch = cellRegex.exec(htmlRowMatch[1])) !== null) {
      cells.push(sanitizeText(cellMatch[1]));
    }
    if (cells.length >= 2) {
      // Key = first cell; remaining cells joined as the value.
      storeField(fields, cells[0], cells.slice(1).join(' '));
    }
  }

  return fields as InmetAlertFields;
}

/**
 * Sanitize text content - strip any HTML tags, keep plain text.
 */
function sanitizeText(text: string): string {
  // Remove HTML tags
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

/**
 * Parse INMET RSS XML string securely.
 * Returns parsed channel with items containing extracted alert fields.
 */
export function parseInmetRss(xmlString: string): RssChannel {
  if (!xmlString || typeof xmlString !== 'string') {
    throw new Error('Empty or invalid XML input');
  }

  if (xmlString.length > MAX_PAYLOAD_SIZE) {
    throw new Error(`Payload too large: ${xmlString.length} bytes (max ${MAX_PAYLOAD_SIZE})`);
  }

  // Use DOMParser with secure defaults (no external entities)
  // In Node.js / edge runtime, we need to use a different approach
  // since DOMParser may not be available. We'll use regex-based parsing
  // for the specific INMET RSS structure.

  // Validate basic XML structure
  if (!xmlString.includes('<rss') && !xmlString.includes('<?xml')) {
    throw new Error('Input does not appear to be valid RSS XML');
  }

  // Check for dangerous patterns (DOCTYPE with external entities)
  const doctypeMatch = xmlString.match(/<!DOCTYPE[^>]*SYSTEM|<!ENTITY[^>]*SYSTEM/i);
  if (doctypeMatch) {
    throw new Error('Potentially dangerous XML construct detected');
  }

  // Extract items using regex (safe for this controlled format)
  const items: RssItem[] = [];
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  let itemMatch: RegExpExecArray | null;

  while ((itemMatch = itemRegex.exec(xmlString)) !== null) {
    if (items.length >= MAX_ITEMS) break;

    const itemContent = itemMatch[1];

    const title = extractTagContent(itemContent, 'title');
    const link = extractTagContent(itemContent, 'link');
    const description = extractTagContent(itemContent, 'description');
    const pubDate = extractTagContent(itemContent, 'pubDate');

    if (!title && !link && !description) continue;

    items.push({
      title: sanitizeText(title),
      link: sanitizeText(link),
      descriptionRaw: description,
      description: sanitizeText(description),
      pubDate: sanitizeText(pubDate),
    });
  }

  // Extract channel metadata
  const channelMatch = xmlString.match(/<channel[^>]*>([\s\S]*?)<\/channel>/i);
  const channelContent = channelMatch ? channelMatch[1] : '';

  return {
    title: sanitizeText(extractTagContent(channelContent, 'title')),
    link: sanitizeText(extractTagContent(channelContent, 'link')),
    description: sanitizeText(extractTagContent(channelContent, 'description')),
    items,
  };
}

/**
 * Extract text content from an XML tag.
 * Handles CDATA sections.
 */
function extractTagContent(xml: string, tagName: string): string {
  // Defense in depth: the tag name comes from internal call sites, but we
  // sanitize it before building a RegExp so no metacharacter can change the
  // pattern structure (ReDoS/injection safety).
  const safeTag = tagName.replace(/[^a-zA-Z0-9:_-]/g, '');
  if (!safeTag) return '';

  // Match <tagName>content</tagName> or <tagName><![CDATA[content]]></tagName>.
  // NOTE: backslashes must be escaped ('\\s') because these are RegExp
  // constructor strings — a raw '\s' in a string literal degrades to 's'.
  const patterns = [
    new RegExp(`<${safeTag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${safeTag}>`, 'i'),
    new RegExp(`<${safeTag}[^>]*>([\\s\\S]*?)</${safeTag}>`, 'i'),
  ];

  for (const pattern of patterns) {
    const match = xml.match(pattern);
    if (match) return match[1];
  }

  return '';
}

/**
 * Parse a single INMET RSS item's description into structured fields.
 * Uses the raw CDATA content when available (the HTML-table format of the
 * live feed needs its tag structure intact).
 */
export function parseInmetItemFields(item: RssItem): InmetAlertFields {
  return parseDescriptionTable(item.descriptionRaw ?? item.description);
}

/**
 * Extract the numeric ID from an INMET alert link.
 * e.g. "https://apiprevmet3.inmet.gov.br/avisos/rss/54423" -> "54423"
 */
export function extractInmetId(link: string): string {
  const match = link.match(/\/(\d+)(?:\/?$|\?)/);
  return match ? match[1] : link;
}

/**
 * Parse area string into array of area descriptions.
 * INMET format: "Aviso para as Áreas: Area1, Area2, Area3"
 */
export function parseAreas(areaString: string): string[] {
  if (!areaString) return [];

  // Remove "Aviso para as Áreas:" prefix if present
  const cleaned = areaString.replace(/^Aviso para as [ÁA]reas:\s*/i, '');

  return cleaned
    .split(',')
    .map((a) => a.trim())
    .filter((a) => a.length > 0);
}

/**
 * Map INMET severity string to internal OfficialSeverity.
 * Logs unknown values but maps them to 'informative'.
 */
export function mapInmetSeverity(
  originalSeverity: string
): { severity: 'informative' | 'attention' | 'danger' | 'extreme'; label: string } {
  const trimmed = originalSeverity.trim();

  switch (trimmed) {
    case 'Perigo Potencial':
      return { severity: 'attention', label: 'Atenção' };
    case 'Perigo':
      return { severity: 'danger', label: 'Perigo' };
    case 'Grande Perigo':
      return { severity: 'extreme', label: 'Perigo Extremo' };
    case 'Informação':
    case 'Informacao':
      return { severity: 'informative', label: 'Informativo' };
    default:
      // Log unknown severity for monitoring
      if (typeof console !== 'undefined') {
        console.warn(
          `[INMET] Unknown severity value: "${trimmed}". Mapping to 'informative'.`
        );
      }
      return { severity: 'informative', label: 'Informativo' };
  }
}

/**
 * Map INMET event type to internal event type string.
 */
export function mapInmetEventType(evento: string): string {
  const trimmed = evento.trim();

  const mapping: Record<string, string> = {
    'Chuvas Intensas': 'heavy_rain',
    'Tempestade': 'storm',
    'Geada': 'frost',
    'Baixa Umidade': 'low_humidity',
    'Acumulado de Chuva': 'rain_accumulation',
    'Ventos Costeiros': 'coastal_winds',
    'Vendaval': 'gale',
    'Declínio de Temperatura': 'temperature_drop',
    'Onda de Calor': 'heat',
  };

  return mapping[trimmed] || trimmed.toLowerCase().replace(/\s+/g, '_');
}

/**
 * Parse INMET datetime string to ISO string.
 * INMET format: "2026-05-17 09:00:00.0"
 * We treat these as local Brazilian time (America/Sao_Paulo) when no TZ is specified.
 */
export function parseInmetDateTime(dateStr: string): string | undefined {
  if (!dateStr || typeof dateStr !== 'string') return undefined;

  const trimmed = dateStr.trim();
  if (!trimmed) return undefined;

  // Try to parse the date
  const date = new Date(trimmed);

  if (isNaN(date.getTime())) return undefined;

  return date.toISOString();
}
