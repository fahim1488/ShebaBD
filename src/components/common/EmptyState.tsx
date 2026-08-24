import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center gap-4 py-20 text-center"
    >
      {Icon && (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ds-muted/10">
          <Icon size={28} className="text-ds-muted" />
        </div>
      )}
      <div>
        <h3 className="font-display text-lg font-semibold text-ds-foreground">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-ds-muted max-w-xs mx-auto">{description}</p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </motion.div>
  );
}
