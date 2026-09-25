import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OfficialAlertDetail } from '@/components/alerts/OfficialAlertDetail';
import type { OfficialAlert } from '@/server/providers/alerts/types';

const baseAlert: OfficialAlert = {
  id: 'inmet-54415',
  source: 'INMET',
  sourceType: 'OFFICIAL_WEATHER',
  externalId: '54415',
  title: 'Aviso de Chuvas Intensas',
  description: 'Chuva entre 30 e 60 mm/h.',
  eventType: 'heavy_rain',
  severity: 'danger',
  originalSeverity: 'Perigo',
  status: 'active',
  issuedAt: '2026-05-17T09:00:00.000Z',
  effectiveAt: '2026-05-17T09:00:00.000Z',
  expiresAt: '2099-12-31T23:59:00.000Z',
  areas: [{ areaDesc: 'Metropolitana de Curitiba' }],
  isOfficial: true,
  isSimulated: false,
  sourceUrl: 'https://apiprevmet3.inmet.gov.br/avisos/rss/54415',
  fetchedAt: '2026-09-24T20:00:00.000Z',
};

describe('OfficialAlertDetail citizen actions', () => {
  beforeEach(() => {
    const store: Record<string, string> = {};
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('translates the raw event type to Portuguese', () => {
    render(<OfficialAlertDetail alert={baseAlert} />);
    expect(screen.getAllByText('Chuvas Intensas').length).toBeGreaterThan(0);
    expect(screen.queryByText('heavy_rain')).not.toBeInTheDocument();
  });

  it('share: copies the link and reports success truthfully', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
    // Place the component on an alert-detail URL (jsdom defaults to "/").
    window.history.pushState({}, '', '/alertas/inmet-54415');

    render(<OfficialAlertDetail alert={baseAlert} />);
    fireEvent.click(screen.getByRole('button', { name: /Compartilhar/i }));

    const status = await screen.findByRole('status');
    expect(status.textContent).toContain('Link copiado');
    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText.mock.calls[0][0] as string).toMatch(
      /\/alertas\/inmet-54415$/
    );
  });

  it('share: never claims success when the clipboard API fails and no fallback exists', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'));
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
    // jsdom has no execCommand — the legacy fallback must fail gracefully.
    document.execCommand = undefined as unknown as typeof document.execCommand;

    render(<OfficialAlertDetail alert={baseAlert} />);
    fireEvent.click(screen.getByRole('button', { name: /Compartilhar/i }));

    const status = await screen.findByRole('status');
    expect(status.textContent).not.toContain('Link copiado');
    expect(
      status.textContent!.includes('Não foi possível copiar') ||
        status.textContent!.includes('indisponível')
    ).toBe(true);
  });

  it('"Estou seguro" stores a LOCAL-only confirmation and says it is not sent to authorities', () => {
    render(<OfficialAlertDetail alert={baseAlert} />);
    fireEvent.click(screen.getByRole('button', { name: /Estou seguro/i }));

    const status = screen.getByText(/registrada apenas neste dispositivo/i);
    expect(status.textContent).toContain('LOCAL');
    expect(status.textContent).not.toContain('enviada a autoridades');

    const stored = JSON.parse(
      window.localStorage.getItem('hidro-alerta-safe-confirmations') ?? '{}'
    );
    expect(stored['inmet-54415']).toBeDefined();
  });

  it('"Preciso de ajuda" opens a dialog with official emergency numbers and no fake submission', () => {
    render(<OfficialAlertDetail alert={baseAlert} />);
    fireEvent.click(screen.getByRole('button', { name: /Preciso de ajuda/i }));

    const dialog = screen.getByRole('dialog');
    expect(dialog.textContent).toContain('192');
    expect(dialog.textContent).toContain('193');
    expect(dialog.textContent).toContain('199');
    expect(dialog.textContent).toContain('ainda não está conectado');
    // There must be no button claiming to "send" the request.
    expect(
      screen.queryByRole('button', { name: /enviar pedido/i })
    ).not.toBeInTheDocument();
  });

  it('keeps the external source link', () => {
    render(<OfficialAlertDetail alert={baseAlert} />);
    expect(screen.getByRole('button', { name: /Ver na fonte/i })).toBeInTheDocument();
  });
});
