import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SidebarSearch } from '@/components/layout/SidebarSearch';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

const ALERT = {
  id: '11111111-2222-3333-4444-555555555555',
  title: 'Alerta de Enchente em São Paulo',
  areas: [{ areaDesc: 'Vila Guilherme' }],
  isOfficial: false,
};

const SHELTER = {
  id: 'shelter-uuid',
  name: 'CEU Vila Guilherme',
  address: 'Rua Carolina Fioravanti, 100 - Vila Guilherme',
};

function stubApi(alerts: unknown[], shelters: unknown[]): void {
  vi.stubGlobal(
    'fetch',
    vi.fn((input: string | URL | Request) => {
      const url = String(input);
      const body = url.includes('shelters') ? shelters : alerts;
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: body, meta: { total: body.length } }),
      });
    }) as unknown as typeof fetch
  );
}

function renderSearch() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <SidebarSearch />
    </QueryClientProvider>
  );
}

/**
 * RECOVERY-2/3: the sidebar search consumes the API (persisted ids) —
 * never mock imports. Navigation works via mouse and keyboard.
 */
describe('SidebarSearch functional navigation', () => {
  beforeEach(() => {
    pushMock.mockClear();
  });

  it('lists alerts and shelters for a query (API data)', async () => {
    stubApi([ALERT], [SHELTER]);
    renderSearch();
    const input = screen.getByRole('combobox', { name: 'Buscar no menu' });
    fireEvent.change(input, { target: { value: 'enchente' } });

    const option = await screen.findByRole('option', {
      name: /Alerta de Enchente em São Paulo/,
    });
    expect(option).toBeInTheDocument();
  });

  it('navigates to the first result with Enter (keyboard) — persisted UUID href', async () => {
    stubApi([ALERT], []);
    renderSearch();
    const input = screen.getByRole('combobox', { name: 'Buscar no menu' });
    fireEvent.change(input, { target: { value: 'mapa' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(pushMock).toHaveBeenCalledWith('/mapa');
  });

  it('navigates to an alert detail with the persisted UUID', async () => {
    stubApi([ALERT], []);
    renderSearch();
    const input = screen.getByRole('combobox', { name: 'Buscar no menu' });
    fireEvent.change(input, { target: { value: 'enchente' } });
    // Wait for the results to resolve before pressing Enter (real usage).
    await screen.findByRole('option', { name: /Alerta de Enchente/ });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(pushMock).toHaveBeenCalledWith(`/alertas/${ALERT.id}`);
  });

  it('navigates with mouse click on a shelter result', async () => {
    stubApi([ALERT], [SHELTER]);
    renderSearch();
    const input = screen.getByRole('combobox', { name: 'Buscar no menu' });
    fireEvent.change(input, { target: { value: 'Vila Guilherme' } });

    const option = await screen
      .findByRole('option', { name: /CEU Vila Guilherme/ });
    fireEvent.mouseDown(option);

    expect(pushMock).toHaveBeenCalledWith('/abrigos');
  });

  it('shows an empty state for unknown queries', async () => {
    stubApi([], []);
    renderSearch();
    const input = screen.getByRole('combobox', { name: 'Buscar no menu' });
    fireEvent.change(input, { target: { value: 'zzz-nada' } });

    expect(await screen.findByRole('listbox').then((l) => l.textContent)).toContain(
      'Nenhum resultado'
    );
  });

  it('Escape closes the results', async () => {
    stubApi([ALERT], []);
    renderSearch();
    const input = screen.getByRole('combobox', { name: 'Buscar no menu' });
    fireEvent.change(input, { target: { value: 'mapa' } });
    expect(await screen.findByRole('listbox')).toBeInTheDocument();

    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
