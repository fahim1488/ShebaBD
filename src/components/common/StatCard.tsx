import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  color?: string;
  trend?: { value: number; label: string };
  index?: number;
}

export default function StatCard({
  label, value, icon: Icon, color = 'text-ds-primary', trend, index = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
      className="rounded-ds-xl border border-ds-muted/10 bg-ds-surface p-5 shadow-ds-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-ds-muted uppercase tracking-wider">{label}</p>
          <p className={`mt-1 text-2xl font-bold font-display ${color}`}>{value}</p>
          {trend && (
            <p className="mt-1 text-xs text-ds-muted">
              <span className={trend.value >= 0 ? 'text-ds-success' : 'text-ds-danger'}>
                {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              {' '}{trend.label}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-ds-lg bg-ds-background ${color}`}>
            <Icon size={20} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
