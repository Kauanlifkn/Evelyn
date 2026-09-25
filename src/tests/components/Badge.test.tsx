import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '@/components/ui/Badge';

describe('Badge', () => {
  it('renders severity 0 as Informativo', () => {
    render(<Badge severity={0} />);
    expect(screen.getByText('Informativo')).toBeInTheDocument();
  });

  it('renders severity 3 as Perigo Extremo', () => {
    render(<Badge severity={3} />);
    expect(screen.getByText('Perigo Extremo')).toBeInTheDocument();
  });

  it('renders custom children when provided', () => {
    render(<Badge severity={2}>Custom Label</Badge>);
    expect(screen.getByText('Custom Label')).toBeInTheDocument();
  });

  it('applies correct bg color for severity 4', () => {
    const { container } = render(<Badge severity={4} />);
    const badge = container.firstElementChild as HTMLElement;
    expect(badge).toHaveClass('bg-hydro-purple-soft');
  });

  it('REGRESSION (RECOVERY-1): is NOT a live region — badges must not use role="status"', () => {
    // role="status" on every badge polluted the live-region namespace,
    // caused duplicate announcements to screen readers and made
    // getByRole('status') ambiguous in tests.
    const { container } = render(<Badge severity={1} />);
    expect(container.querySelector('span[role="status"]')).toBeNull();
  });
});
