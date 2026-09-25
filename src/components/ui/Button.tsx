import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const variants = {
  // blue-700 base (not blue-600): white text needs >=4.5:1 (AA) — blue-600
  // measured ~4.1:1. blue-700 ≈ 6:1.
  primary: 'bg-hydro-blue-700 text-white hover:bg-hydro-blue-800 focus-visible:bg-hydro-blue-800',
  secondary: 'bg-hydro-surface-blue text-hydro-text hover:bg-hydro-border/50 focus-visible:bg-hydro-border/50',
  // danger-dark base (not danger): same AA rationale (~5.8:1).
  danger: 'bg-hydro-danger-dark text-white hover:bg-hydro-danger focus-visible:bg-hydro-danger-dark',
  outline: 'border border-hydro-border text-hydro-text hover:bg-hydro-surface-blue focus-visible:bg-hydro-surface-blue',
  ghost: 'text-hydro-text-secondary hover:bg-hydro-surface-blue focus-visible:bg-hydro-surface-blue',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hydro-cyan-500',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
