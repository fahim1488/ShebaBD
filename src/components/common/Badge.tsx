import type { LucideIcon } from 'lucide-react';

type BadgeVariant = 'success' | 'danger' | 'warning' | 'info' | 'default';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  icon?: LucideIcon;
  dot?: boolean;
}

const VARIANTS: Record<BadgeVariant, string> = {
  success: 'bg-ds-success/10 text-ds-success border-ds-success/20',
  danger:  'bg-ds-danger/10  text-ds-danger  border-ds-danger/20',
  warning: 'bg-ds-warning/10 text-ds-warning border-ds-warning/20',
  info:    'bg-ds-secondary/10 text-ds-secondary border-ds-secondary/20',
  default: 'bg-ds-muted/10 text-ds-muted border-ds-muted/20',
};

export default function Badge({ label, variant = 'default', icon: Icon, dot }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${VARIANTS[variant]}`}>
      {dot && (
        <span className="h-1.5 w-1.5 rounded-full bg-current shrink-0" />
      )}
      {Icon && <Icon size={11} className="shrink-0" />}
      {label}
    </span>
  );
}
