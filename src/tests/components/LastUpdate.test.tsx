import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { LastUpdate } from '@/components/dashboard/LastUpdate';

/**
 * Hydration regression (RECOVERY-1).
 *
 * The original bug: the component formatted `new Date()` during render, so
 * the server HTML and the first client render diverged (hydration error on
 * the dashboard).
 *
 * Contract now: the server output (renderToString) must equal the first
 * client render — a stable placeholder — and the formatted time appears
 * only after mount (useEffect), with a fixed timezone.
 */
describe('LastUpdate hydration contract', () => {
  const TIME = '2026-01-15T03:30:00.000Z';

  // React SSR interleaves comment markers (<!-- -->) between text nodes.
  function stripSsrMarkers(html: string): string {
    return html.replace(/<!-- -->/g, '');
  }

  it('SSR output contains only the stable placeholder (no volatile date)', () => {
    const html = stripSsrMarkers(renderToString(<LastUpdate time={TIME} />));
    expect(html).toContain('Última atualização: —');
    expect(html).not.toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });

  it('after mount, the formatted time replaces the placeholder', async () => {
    // The component defers its update to a microtask; async act flushes it.
    await act(async () => {
      render(<LastUpdate time={TIME} />);
    });
    expect(screen.getByText(/Última atualização:/)).toBeInTheDocument();
    expect(screen.getByText(/15\/01\/2026/)).toBeInTheDocument();
    expect(screen.getByText(/00:30/)).toBeInTheDocument();
  });

  it('formats with a fixed timezone (America/Sao_Paulo), not the host timezone', async () => {
    // 03:30 UTC = 00:30 in São Paulo (same calendar day).
    let container: HTMLElement;
    await act(async () => {
      ({ container } = render(<LastUpdate time={TIME} />));
    });
    const text = container!.textContent ?? '';
    expect(text).toContain('15/01/2026');
    expect(text).toContain('00:30');
    // The hour must NOT be the host-local rendering of the UTC instant.
    expect(text).not.toContain('03:30');
  });

  it('never renders the raw ISO string', () => {
    const html = stripSsrMarkers(renderToString(<LastUpdate time={TIME} />));
    expect(html).not.toContain('2026-01-15');
  });
});
