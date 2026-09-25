import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DemoBanner } from '@/components/layout/DemoBanner';

describe('DemoBanner', () => {
  it('mock mode: states that all displayed data is simulated', () => {
    render(<DemoBanner mode="mock" />);
    const banner = screen.getByRole('status', {
      name: 'Informações sobre os dados',
    });
    expect(banner).toHaveTextContent('todos os dados desta demonstração são simulados');
    expect(banner).toHaveTextContent('nenhum alerta exibido é real');
  });

  it('official mode: INMET alerts are official, remaining modules may be simulated', () => {
    render(<DemoBanner mode="official" />);
    const banner = screen.getByRole('status', {
      name: 'Informações sobre os dados',
    });
    expect(banner).toHaveTextContent('alertas meteorológicos do INMET são oficiais');
    expect(banner).toHaveTextContent('demais módulos podem conter dados simulados');
  });

  it('defaults to mock mode when no mode is provided', () => {
    render(<DemoBanner />);
    expect(
      screen.getByRole('status', { name: 'Informações sobre os dados' })
    ).toHaveTextContent('nenhum alerta exibido é real');
  });

  it('never claims in official mode that "no alert is real"', () => {
    render(<DemoBanner mode="official" />);
    const banner = screen.getByRole('status', {
      name: 'Informações sobre os dados',
    });
    expect(banner.textContent).not.toContain('nenhum alerta exibido é real');
  });
});
