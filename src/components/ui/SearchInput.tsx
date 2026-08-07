'use client';

import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  variant?: 'default' | 'dark';
  'aria-label'?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Buscar...',
  className,
  variant = 'default',
  ...props
}: SearchInputProps) {
  return (
    <div className={cn('relative', className)}>
      <Search
        className={cn(
          'absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2',
          variant === 'dark' ? 'text-hydro-text-muted' : 'text-hydro-text-muted'
        )}
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={props['aria-label'] ?? placeholder}
        className={cn(
          'w-full rounded-lg border py-2 pl-10 pr-4 text-sm transition-colors',
          variant === 'dark'
            ? 'border-hydro-navy-700 bg-hydro-navy-800 text-hydro-text-on-dark placeholder:text-hydro-text-muted focus:border-hydro-cyan-500 focus:outline-none focus:ring-2 focus:ring-hydro-cyan-500/20'
            : 'border-hydro-border bg-hydro-surface text-hydro-text placeholder:text-hydro-text-secondary focus:border-hydro-blue-600 focus:outline-none focus:ring-2 focus:ring-hydro-blue-600/20'
        )}
      />
    </div>
  );
}
