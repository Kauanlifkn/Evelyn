import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '@/components/ui/Badge';

describe('Badge', () => {
  it('renders severity 0 as Informativo', () => {
    render(<Badge severity={0} />);
    expect(screen.getByRole('status')).toHaveTextContent('Informativo');
  });

  it('renders severity 3 as Perigo Extremo', () => {
    render(<Badge severity={3} />);
    expect(screen.getByRole('status')).toHaveTextContent('Perigo Extremo');
  });

  it('renders custom children when provided', () => {
    render(<Badge severity={2}>Custom Label</Badge>);
    expect(screen.getByRole('status')).toHaveTextContent('Custom Label');
  });

  it('applies correct bg color for severity 4', () => {
    render(<Badge severity={4} />);
    expect(screen.getByRole('status')).toHaveClass('bg-hydro-purple-soft');
  });
});
