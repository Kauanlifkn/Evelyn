/**
 * Alert Provider Factory
 *
 * Selects the appropriate provider based on ALERT_DATA_MODE env var.
 * - "official" → INMET provider (real data)
 * - "mock" → Mock provider (development/demo)
 *
 * Architecture is ready for future providers (e.g., IDAP when a public API is available).
 */

import type { AlertProvider } from './types';
import { getInmetProvider } from './inmet-provider';
import { getMockProvider } from './mock-provider';

export type { OfficialAlert, AlertArea, SourceHealth, SourceStatus, OfficialSeverity, OfficialAlertStatus } from './types';

let cachedProvider: AlertProvider | null = null;

export function getAlertProvider(): AlertProvider {
  if (cachedProvider) return cachedProvider;

  const mode = process.env.ALERT_DATA_MODE || 'mock';

  switch (mode) {
    case 'official':
      cachedProvider = getInmetProvider();
      break;
    case 'mock':
    default:
      cachedProvider = getMockProvider();
      break;
  }

  return cachedProvider;
}

export function getAlertDataMode(): string {
  return process.env.ALERT_DATA_MODE || 'mock';
}

/**
 * Future: IDAP Provider
 *
 * When the Defesa Civil Nacional / CENAD / MIDR provides a validated public API,
 * create `idap-provider.ts` implementing AlertProvider and add it here.
 *
 * case 'defesa_civil':
 *   cachedProvider = getIdapProvider();
 *   break;
 */
