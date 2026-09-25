import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { InmetProvider } from '@/server/providers/alerts/inmet-provider';

const fixturePath = join(__dirname, '../fixtures/inmet-rss.fixture.xml');
const fixtureXml = readFileSync(fixturePath, 'utf-8');

describe('InmetProvider', () => {
  let provider: InmetProvider;

  beforeEach(() => {
    vi.unstubAllGlobals();
    provider = new InmetProvider('https://mock-inmet.test/rss');
  });

  describe('fetchActiveAlerts', () => {
    it('normalizes fixture data into OfficialAlert array', async () => {
      vi.stubGlobal('fetch', () =>
        Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/xml' }),
          text: () => Promise.resolve(fixtureXml),
        })
      );

      const alerts = await provider.fetchActiveAlerts();
      const active = alerts.filter((a) => a.status === 'active');

      expect(active.length).toBeGreaterThan(0);

      const first = active[0];
      expect(first.source).toBe('INMET');
      expect(first.sourceType).toBe('OFFICIAL_WEATHER');
      expect(first.isOfficial).toBe(true);
      expect(first.isSimulated).toBe(false);
      expect(first.id).toMatch(/^inmet-\d+$/);
      expect(first.originalSeverity).toBeDefined();
      expect(first.areas.length).toBeGreaterThan(0);
      expect(first.fetchedAt).toBeDefined();
    });

    it('maps severities correctly', async () => {
      vi.stubGlobal('fetch', () =>
        Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers(),
          text: () => Promise.resolve(fixtureXml),
        })
      );

      const alerts = await provider.fetchActiveAlerts();

      const perigo = alerts.find((a) => a.originalSeverity === 'Perigo');
      expect(perigo?.severity).toBe('danger');

      const potencial = alerts.find((a) => a.originalSeverity === 'Perigo Potencial');
      expect(potencial?.severity).toBe('attention');
    });

    it('deduplicates by external ID', async () => {
      const dupXml = fixtureXml.replace('</channel>', fixtureXml.match(/<item>[\s\S]*?<\/item>/)?.[0] + '</channel>');

      vi.stubGlobal('fetch', () =>
        Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers(),
          text: () => Promise.resolve(dupXml),
        })
      );

      const alerts = await provider.fetchActiveAlerts();
      const ids = alerts.map((a) => a.externalId);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
    });

    it('handles HTTP 500', async () => {
      vi.stubGlobal('fetch', () =>
        Promise.resolve({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          headers: new Headers(),
          text: () => Promise.resolve(''),
        })
      );

      const alerts = await provider.fetchActiveAlerts();
      expect(alerts).toEqual([]);

      const health = provider.getSourceHealth();
      expect(health.status).toBe('OFFLINE');
      expect(health.errorCode).toBe('HTTP_500');
    });

    it('handles HTTP 404', async () => {
      vi.stubGlobal('fetch', () =>
        Promise.resolve({
          ok: false,
          status: 404,
          statusText: 'Not Found',
          headers: new Headers(),
          text: () => Promise.resolve(''),
        })
      );

      const alerts = await provider.fetchActiveAlerts();
      expect(alerts).toEqual([]);

      const health = provider.getSourceHealth();
      expect(health.errorCode).toBe('HTTP_404');
    });

    it('handles empty response', async () => {
      vi.stubGlobal('fetch', () =>
        Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers(),
          text: () => Promise.resolve(''),
        })
      );

      const alerts = await provider.fetchActiveAlerts();
      expect(alerts).toEqual([]);

      const health = provider.getSourceHealth();
      expect(health.errorCode).toBe('EMPTY_RESPONSE');
    });

    it('handles timeout via AbortController', async () => {
      const abortError = new DOMException('The operation was aborted', 'AbortError');
      vi.stubGlobal('fetch', () => Promise.reject(abortError));

      const alerts = await provider.fetchActiveAlerts();
      expect(alerts).toEqual([]);

      const health = provider.getSourceHealth();
      expect(health.errorCode).toBe('TIMEOUT');
    });

    it('handles network error', async () => {
      vi.stubGlobal('fetch', () => Promise.reject(new TypeError('fetch failed')));

      const alerts = await provider.fetchActiveAlerts();
      expect(alerts).toEqual([]);

      const health = provider.getSourceHealth();
      expect(health.status).toBe('OFFLINE');
    });

    it('handles malformed XML', async () => {
      vi.stubGlobal('fetch', () =>
        Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/xml' }),
          text: () => Promise.resolve('<broken xml <<<'),
        })
      );

      const alerts = await provider.fetchActiveAlerts();
      // May return empty or some items depending on parse behavior
      expect(Array.isArray(alerts)).toBe(true);
    });

    it('retries once after a transient HTTP 500 and succeeds (RECOVERY-1)', async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          headers: new Headers(),
          text: () => Promise.resolve(''),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers(),
          text: () => Promise.resolve(fixtureXml),
        });
      vi.stubGlobal('fetch', fetchMock);

      const alerts = await provider.fetchActiveAlerts();

      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(alerts.length).toBeGreaterThan(0);
      expect(provider.getSourceHealth().status).toBe('ONLINE');
    });

    it('does not retry non-retryable client errors like 404 (RECOVERY-1)', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: new Headers(),
        text: () => Promise.resolve(''),
      });
      vi.stubGlobal('fetch', fetchMock);

      await provider.fetchActiveAlerts();
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('never falls back to mock data when the source fails (RECOVERY-1)', async () => {
      vi.stubGlobal('fetch', () =>
        Promise.reject(new TypeError('fetch failed'))
      );

      const alerts = await provider.fetchActiveAlerts();
      // Failure must be empty — NOT mock alerts — so the UI can never
      // present simulated data as official after a source failure.
      expect(alerts).toEqual([]);
    });
  });

  describe('getSourceHealth', () => {
    it('returns OFFLINE initially', () => {
      const health = provider.getSourceHealth();
      expect(health.source).toBe('INMET');
      expect(health.status).toBe('OFFLINE');
      expect(health.lastAttemptAt).toBeNull();
    });

    it('returns ONLINE after successful fetch', async () => {
      vi.stubGlobal('fetch', () =>
        Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers(),
          text: () => Promise.resolve(fixtureXml),
        })
      );

      await provider.fetchActiveAlerts();
      const health = provider.getSourceHealth();
      expect(health.status).toBe('ONLINE');
      expect(health.lastSuccessAt).not.toBeNull();
      expect(health.latencyMs).not.toBeNull();
    });
  });
});
