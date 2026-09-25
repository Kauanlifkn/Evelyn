/**
 * INMET Alert Provider
 *
 * Fetches and normalizes alerts from INMET's public RSS feed.
 * Source: https://apiprevmet3.inmet.gov.br/avisos/rss
 * No authentication required. Server-side only.
 */

import type {
  OfficialAlert,
  AlertProvider,
  SourceHealth,
  AlertArea,
} from './types';
import {
  parseInmetRss,
  parseInmetItemFields,
  extractInmetId,
  parseAreas,
  mapInmetSeverity,
  mapInmetEventType,
  parseInmetDateTime,
} from '@/server/lib/rss-parser';

const DEFAULT_RSS_URL = 'https://apiprevmet3.inmet.gov.br/avisos/rss';
const FETCH_TIMEOUT_MS = 15_000;
const CACHE_TTL_MS = 120_000; // 120 seconds
const MAX_ATTEMPTS = 2; // 1 initial attempt + 1 controlled retry
const RETRY_DELAY_MS = 800;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableStatus(status: number): boolean {
  // Retry transient failures only: server errors and rate limiting.
  return status >= 500 || status === 429;
}

class InmetProvider implements AlertProvider {
  private rssUrl: string;
  private cache: {
    alerts: OfficialAlert[];
    fetchedAt: number;
  } | null = null;
  private health: SourceHealth;

  constructor(rssUrl?: string) {
    this.rssUrl = rssUrl || process.env.INMET_RSS_URL || DEFAULT_RSS_URL;
    this.health = {
      source: 'INMET',
      status: 'OFFLINE',
      lastAttemptAt: null,
      lastSuccessAt: null,
      latencyMs: null,
      errorCode: null,
      message: null,
    };
  }

  async fetchActiveAlerts(): Promise<OfficialAlert[]> {
    const now = Date.now();
    const startTime = performance.now();

    // Check cache
    if (this.cache && now - this.cache.fetchedAt < CACHE_TTL_MS) {
      return this.filterActiveAlerts(this.cache.alerts);
    }

    this.health.lastAttemptAt = new Date().toISOString();
    this.health.errorCode = null;
    this.health.message = null;

    // Controlled retry loop: transient HTTP/network failures are retried
    // once with a short backoff. Parse failures are deterministic and are
    // NOT retried. Failure never falls back to mocks — stale cache or empty.
    let xmlString: string | null = null;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

      try {
        const response = await fetch(this.rssUrl, {
          signal: controller.signal,
          headers: {
            Accept: 'application/xml, text/xml, application/rss+xml, */*',
            'User-Agent': 'HidroAlerta/0.1 (contact via project repository)',
          },
        });

        if (!response.ok) {
          if (attempt < MAX_ATTEMPTS && isRetryableStatus(response.status)) {
            console.warn(
              `[INMET] Attempt ${attempt} failed: HTTP ${response.status}. Retrying in ${RETRY_DELAY_MS}ms`
            );
            await delay(RETRY_DELAY_MS);
            continue;
          }
          this.health.latencyMs = Math.round(performance.now() - startTime);
          this.health.status = 'OFFLINE';
          this.health.errorCode = `HTTP_${response.status}`;
          this.health.message = `HTTP ${response.status} ${response.statusText}`;
          console.error(
            `[INMET] Fetch failed: HTTP ${response.status} ${response.statusText}`
          );
          return this.returnStaleOrEmpty();
        }

        xmlString = await response.text();

        if (!xmlString || xmlString.trim().length === 0) {
          if (attempt < MAX_ATTEMPTS) {
            await delay(RETRY_DELAY_MS);
            continue;
          }
          this.health.latencyMs = Math.round(performance.now() - startTime);
          this.health.status = 'OFFLINE';
          this.health.errorCode = 'EMPTY_RESPONSE';
          this.health.message = 'Empty response body';
          return this.returnStaleOrEmpty();
        }

        break; // Successful fetch
      } catch (error) {
        const isTimeout =
          error instanceof DOMException && error.name === 'AbortError';
        const isNetwork = error instanceof TypeError; // fetch network failure

        if (
          attempt < MAX_ATTEMPTS &&
          (isTimeout || isNetwork)
        ) {
          console.warn(
            `[INMET] Attempt ${attempt} failed (${isTimeout ? 'timeout' : 'network'}). Retrying in ${RETRY_DELAY_MS}ms`
          );
          await delay(RETRY_DELAY_MS);
          continue;
        }

        this.health.latencyMs = Math.round(performance.now() - startTime);
        this.health.status = 'OFFLINE';
        if (isTimeout) {
          this.health.errorCode = 'TIMEOUT';
          this.health.message = `Request timed out after ${FETCH_TIMEOUT_MS}ms`;
          console.error(`[INMET] Fetch timed out after ${FETCH_TIMEOUT_MS}ms`);
        } else {
          this.health.errorCode = 'NETWORK_ERROR';
          this.health.message =
            error instanceof Error ? error.message : 'Network error';
          console.error(
            `[INMET] Fetch failed: ${this.health.message}`
          );
        }
        return this.returnStaleOrEmpty();
      } finally {
        clearTimeout(timeoutId);
      }
    }

    if (!xmlString) {
      // Should not happen (every path above returns), but fail safe.
      this.health.status = 'OFFLINE';
      this.health.errorCode = this.health.errorCode ?? 'UNKNOWN';
      this.health.message = this.health.message ?? 'No response received';
      return this.returnStaleOrEmpty();
    }

    // Parse and normalize (no retry — a parse error is deterministic).
    try {
      const channel = parseInmetRss(xmlString);
      const alerts = this.normalizeAlerts(channel.items);

      // Update cache
      this.cache = {
        alerts,
        fetchedAt: now,
      };

      // Update health
      this.health.status = 'ONLINE';
      this.health.latencyMs = Math.round(performance.now() - startTime);
      this.health.lastSuccessAt = new Date().toISOString();

      console.log(
        `[INMET] Fetched ${alerts.length} alerts (${this.health.latencyMs}ms)`
      );

      return this.filterActiveAlerts(alerts);
    } catch (error) {
      this.health.latencyMs = Math.round(performance.now() - startTime);
      this.health.status = 'OFFLINE';
      this.health.errorCode = 'PARSE_ERROR';
      this.health.message =
        error instanceof Error ? error.message : 'Unknown parse error';
      console.error(`[INMET] Parse error: ${this.health.message}`);
      return this.returnStaleOrEmpty();
    }
  }

  getSourceHealth(): SourceHealth {
    // If we have a cache that's still within 2x TTL, mark as STALE instead of OFFLINE
    if (
      this.health.status === 'OFFLINE' &&
      this.cache &&
      this.cache.fetchedAt
    ) {
      const age = Date.now() - this.cache.fetchedAt;
      if (age < CACHE_TTL_MS * 5) {
        return { ...this.health, status: 'STALE' };
      }
    }

    return { ...this.health };
  }

  private normalizeAlerts(items: Array<{
    title: string;
    link: string;
    description: string;
    pubDate: string;
  }>): OfficialAlert[] {
    const alerts: OfficialAlert[] = [];
    const seen = new Set<string>();

    for (const item of items) {
      const externalId = extractInmetId(item.link);

      // Deduplicate by external ID
      if (seen.has(externalId)) continue;
      seen.add(externalId);

      try {
        const fields = parseInmetItemFields(item);
        const { severity } = mapInmetSeverity(fields.severidade || '');
        const areas = parseAreas(fields.area || '');

        const alert: OfficialAlert = {
          id: `inmet-${externalId}`,
          source: 'INMET',
          sourceType: 'OFFICIAL_WEATHER',
          externalId,
          title: item.title || `Aviso de ${fields.evento || 'Evento'}`,
          description: fields.descricao || item.description || '',
          eventType: mapInmetEventType(fields.evento || ''),
          severity,
          originalSeverity: fields.severidade || 'Desconhecida',
          status: 'active', // Will be re-evaluated by filterActiveAlerts
          issuedAt: parseInmetDateTime(item.pubDate),
          effectiveAt: parseInmetDateTime(fields.inicio),
          expiresAt: parseInmetDateTime(fields.fim),
          areas: areas.map((a) => ({ areaDesc: a } as AlertArea)),
          isOfficial: true,
          isSimulated: false,
          sourceUrl: item.link,
          fetchedAt: new Date().toISOString(),
        };

        alerts.push(alert);
      } catch (error) {
        console.warn(
          `[INMET] Failed to normalize item ${externalId}:`,
          error instanceof Error ? error.message : error
        );
      }
    }

    return alerts;
  }

  private filterActiveAlerts(alerts: OfficialAlert[]): OfficialAlert[] {
    const now = new Date();

    return alerts.map((alert) => {
      if (alert.expiresAt) {
        const expires = new Date(alert.expiresAt);
        if (expires < now) {
          return { ...alert, status: 'expired' as const };
        }
      }
      return { ...alert, status: 'active' as const };
    });
  }

  /**
   * Return stale cached data if available, otherwise empty array.
   * Never returns mocks.
   */
  private returnStaleOrEmpty(): OfficialAlert[] {
    if (this.cache && this.cache.alerts.length > 0) {
      console.warn(
        '[INMET] Returning stale cached data due to fetch failure'
      );
      return this.filterActiveAlerts(this.cache.alerts);
    }

    console.warn('[INMET] No cached data available, returning empty array');
    return [];
  }
}

// Singleton instance
let instance: InmetProvider | null = null;

export function getInmetProvider(rssUrl?: string): InmetProvider {
  if (!instance) {
    instance = new InmetProvider(rssUrl);
  }
  return instance;
}

export { InmetProvider };
