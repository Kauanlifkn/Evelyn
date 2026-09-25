import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SidebarSearch } from '@/components/layout/SidebarSearch';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

/**
 * Regression (RECOVERY-1): the sidebar search previously had no effect
 * (state with no consumer). It must now navigate to pages, alerts and
 * shelters via mouse and keyboard.
 */
describe('SidebarSearch functional navigation', () => {
  beforeEach(() => {
    pushMock.mockClear();
  });

  it('lists pages, alerts and shelters for a query', () => {
    render(<SidebarSearch />);
    const input = screen.getByRole('combobox', { name: 'Buscar no menu' });
    fireEvent.change(input, { target: { value: 'enchente' } });

    const listbox = screen.getByRole('listbox');
    expect(listbox.textContent).toContain('Alerta de Enchente em São Paulo');
  });

  it('navigates to the first result with Enter (keyboard)', () => {
    render(<SidebarSearch />);
    const input = screen.getByRole('combobox', { name: 'Buscar no menu' });
    fireEvent.change(input, { target: { value: 'mapa' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(pushMock).toHaveBeenCalledWith('/mapa');
  });

  it('navigates with mouse click on a result', () => {
    render(<SidebarSearch />);
    const input = screen.getByRole('combobox', { name: 'Buscar no menu' });
    fireEvent.change(input, { target: { value: 'Vila Guilherme' } });

    const option = screen
      .getAllByRole('option')
      .find((el) => el.textContent?.includes('CEU Vila Guilherme'));
    expect(option).toBeDefined();
    fireEvent.mouseDown(option!);

    expect(pushMock).toHaveBeenCalledWith('/abrigos');
  });

  it('navigates to an alert detail with ArrowDown + Enter', () => {
    render(<SidebarSearch />);
    const input = screen.getByRole('combobox', { name: 'Buscar no menu' });
    fireEvent.change(input, { target: { value: 'deslizamento' } });
    // First ArrowDown moves past the first (page) hit to an alert hit.
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(pushMock).toHaveBeenCalledWith(
      expect.stringMatching(/^\/alertas\/alert-\d{3}$/)
    );
  });

  it('shows an empty state for unknown queries', () => {
    render(<SidebarSearch />);
    const input = screen.getByRole('combobox', { name: 'Buscar no menu' });
    fireEvent.change(input, { target: { value: 'zzz-nada-encontrado' } });

    expect(screen.getByRole('listbox').textContent).toContain('Nenhum resultado');
  });

  it('Escape closes the results', () => {
    render(<SidebarSearch />);
    const input = screen.getByRole('combobox', { name: 'Buscar no menu' });
    fireEvent.change(input, { target: { value: 'mapa' } });
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
