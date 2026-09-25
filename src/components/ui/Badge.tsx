import { cn } from '@/lib/utils';

interface BadgeProps {
  severity: number;
  className?: string;
  children?: React.ReactNode;
}

const severityConfig: Record<number, { bg: string; text: string; label: string }> = {
  0: { bg: 'bg-hydro-blue-soft', text: 'text-hydro-blue-700', label: 'Informativo' },
  1: { bg: 'bg-hydro-warning-soft', text: 'text-hydro-warning-dark', label: 'Atenção' },
  2: { bg: 'bg-hydro-orange-soft', text: 'text-hydro-orange-dark', label: 'Perigo' },
  3: { bg: 'bg-hydro-danger-soft', text: 'text-hydro-danger-dark-text', label: 'Perigo Extremo' },
  4: { bg: 'bg-hydro-purple-soft', text: 'text-hydro-purple-dark', label: 'Emergência' },
};

export function Badge({ severity, className, children }: BadgeProps) {
  const config = severityConfig[severity] ?? severityConfig[0];
  return (
    // Plain text span on purpose: badges are NOT live regions
    // (role="status" would announce every badge to screen readers).
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold',
        config.bg,
        config.text,
        className
      )}
    >
      {children ?? config.label}
    </span>
  );
}
