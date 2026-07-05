/**
 * ShebaBDLogo — matches the reference design exactly
 *
 * Mark  : circular red disc (#D6472C) with white mono "S" — matches .logo .mark
 * Text  : Fraunces serif "Sheba" + red "BD"
 */
import { cn } from '@/utils/cn';

interface ShebaBDLogoProps {
  size?: number;
  showText?: boolean;
  textSize?: string;
  className?: string;
  /** 'dark' = white text (for dark bg nav/footer), 'light' = dark text (for paper bg) */
  variant?: 'dark' | 'light';
}

export function ShebaBDLogo({
  size = 30,
  showText = true,
  textSize = 'text-[19px]',
  className,
  variant = 'dark',
}: ShebaBDLogoProps) {
  const textColor = variant === 'dark' ? 'text-[#F7F1E1]' : 'text-[#0B2E22]';

  return (
    <span className={cn('inline-flex items-center gap-[10px]', className)}>
      {/* ── Circular disc mark ─────────────────────────────────────────────── */}
      <span
        style={{ width: size, height: size, minWidth: size }}
        className="rounded-full bg-[#D6472C] flex items-center justify-center shrink-0"
      >
        <span
          style={{ fontSize: Math.round(size * 0.47) }}
          className="font-mono-ibm font-semibold text-[#F7F1E1] leading-none select-none"
        >
          S
        </span>
      </span>

      {/* ── Wordmark ──────────────────────────────────────────────────────── */}
      {showText && (
        <span
          className={cn(
            'font-fraunces font-semibold leading-none tracking-[-0.01em]',
            textColor,
            textSize,
          )}
        >
          Sheba<span className="text-[#D6472C]">BD</span>
        </span>
      )}
    </span>
  );
}
