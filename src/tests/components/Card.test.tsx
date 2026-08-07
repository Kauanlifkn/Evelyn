import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Card } from '@/components/ui/Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Conteúdo do cartão</Card>);
    expect(screen.getByText('Conteúdo do cartão')).toBeInTheDocument();
  });

  it('does not have button role when no onClick', () => {
    render(<Card>Sem clique</Card>);
    expect(screen.getByText('Sem clique').parentElement).not.toHaveAttribute('role');
  });

  it('has button role when onClick is provided', () => {
    const fn = vi.fn();
    render(<Card onClick={fn}>Clicável</Card>);
    const card = screen.getByRole('button');
    expect(card).toBeInTheDocument();
    fireEvent.click(card);
    expect(fn).toHaveBeenCalledOnce();
  });
});
