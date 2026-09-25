import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('renders children text', () => {
    render(<Button>Clique aqui</Button>);
    expect(screen.getByText('Clique aqui')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const fn = vi.fn();
    render(<Button onClick={fn}>Enviar</Button>);
    fireEvent.click(screen.getByText('Enviar'));
    expect(fn).toHaveBeenCalledOnce();
  });

  it('does not call onClick when disabled', () => {
    const fn = vi.fn();
    render(<Button onClick={fn} disabled>Desabilitado</Button>);
    fireEvent.click(screen.getByText('Desabilitado'));
    expect(fn).not.toHaveBeenCalled();
  });

  it('applies danger variant styles', () => {
    // RECOVERY-1: danger base moved to danger-dark for AA contrast
    // (white text on bg-hydro-danger was ~4.1:1).
    render(<Button variant="danger">Perigo</Button>);
    expect(screen.getByText('Perigo')).toHaveClass('bg-hydro-danger-dark');
  });
});
