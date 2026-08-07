import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchInput } from '@/components/ui/SearchInput';

describe('SearchInput', () => {
  it('renders with placeholder', () => {
    render(<SearchInput value="" onChange={() => {}} placeholder="Buscar alertas..." />);
    expect(screen.getByPlaceholderText('Buscar alertas...')).toBeInTheDocument();
  });

  it('calls onChange when typing', () => {
    let value = '';
    render(<SearchInput value={value} onChange={(v) => { value = v; }} />);
    const input = screen.getByPlaceholderText('Buscar...');
    fireEvent.change(input, { target: { value: 'enchente' } });
    expect(value).toBe('enchente');
  });

  it('has correct aria-label', () => {
    render(
      <SearchInput
        value=""
        onChange={() => {}}
        aria-label="Buscar alertas"
        placeholder="Buscar..."
      />
    );
    expect(screen.getByLabelText('Buscar alertas')).toBeInTheDocument();
  });
});
