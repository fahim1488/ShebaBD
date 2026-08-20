import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

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
  badgeColor = 'border-[#E7A93B]/30 bg-[#E7A93B]/10 text-[#E7A93B]',
}: PageHeaderProps) {
  return (
    <section 
      style={{ background: 'linear-gradient(135deg, #0B2E22 0%, #0F3A2B 50%, #0B2E22 100%)' }}
      className="py-14 border-b border-[rgba(247,241,225,0.12)]"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-2xl"
        >
          {badge && (
            <span className={`mb-3 inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-medium backdrop-blur-md ${badgeColor}`}>
              {BadgeIcon && <BadgeIcon size={12} />}
              {badge}
            </span>
          )}
          <h1 className="font-display text-3xl font-bold text-[#F7F1E1] md:text-4xl tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-3 text-[rgba(247,241,225,0.75)] leading-relaxed text-base">{subtitle}</p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
