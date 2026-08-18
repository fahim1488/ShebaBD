import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  badge?: string;
  badgeIcon?: LucideIcon;
  title: string;
  subtitle?: string;
  badgeColor?: string;
}

export default function PageHeader({
  badge,
  badgeIcon: BadgeIcon,
  title,
  subtitle,
  badgeColor = 'border-ds-primary/20 bg-ds-primary/10 text-ds-primary',
}: PageHeaderProps) {
  return (
    <section className="bg-gradient-to-br from-ds-primary/5 via-ds-background to-ds-secondary/5 py-14">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-2xl"
        >
          {badge && (
            <span className={`mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${badgeColor}`}>
              {BadgeIcon && <BadgeIcon size={12} />}
              {badge}
            </span>
          )}
          <h1 className="font-display text-3xl font-bold text-ds-foreground md:text-4xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-3 text-ds-muted leading-relaxed">{subtitle}</p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
