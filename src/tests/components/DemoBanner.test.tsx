import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DemoBanner } from '@/components/layout/DemoBanner';

describe('DemoBanner', () => {
  it('renders demonstration warning text', () => {
    render(<DemoBanner />);
    expect(screen.getByRole('status')).toHaveTextContent('Ambiente de demonstração');
  });

  it('contains simulated data notice', () => {
    render(<DemoBanner />);
    expect(screen.getByRole('status')).toHaveTextContent('dados simulados');
  });
});
