/**
 * ShebaBDLogo — gradient squircle with heart-handshake icon + "ShebaBD" wordmark
 *
 * Mark  : red→orange gradient rounded rect with Lucide heart-handshake icon in white
 * Text  : "ShebaBD" in Bricolage Grotesque bold
 */
import { cn } from '@/utils/cn';

interface ShebaBDLogoProps {
  size?: number;
  showText?: boolean;
  textSize?: number;
  className?: string;
  /** 'dark' = cream text (for dark bg nav/footer), 'light' = dark text (for light bg) */
  variant?: 'dark' | 'light';
}

export function ShebaBDLogo({
  size = 32,
  showText = true,
  textSize = 18,
  className,
  variant = 'dark',
}: ShebaBDLogoProps) {
  const textColor = variant === 'dark' ? '#F7F1E1' : '#111827';

  // The icon SVG viewport is 24×24, scaled to fit inside the 40×40 mark box
  // Mark box: 40×40 — icon padded by 7px each side → 26×26 icon area
  const markSize = 40;
  const iconPad = 7;
  const iconArea = markSize - iconPad * 2; // 26
  const iconScale = iconArea / 24;         // scale factor for 24×24 viewbox

  const gap = 10;
  const wordmarkX = markSize + gap;
  const totalW = showText ? wordmarkX + textSize * 5.0 : markSize;
  const totalH = markSize;

  const scale = size / markSize;

  return (
    <span className={cn('inline-flex items-center', className)}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${totalW} ${totalH}`}
        width={totalW * scale}
        height={totalH * scale}
        aria-label="ShebaBD"
        role="img"
        style={{ display: 'block' }}
      >
        <defs>
          <linearGradient id="sheba-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e63c1e" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>

        {/* Rounded square background */}
        <rect x="0" y="0" width={markSize} height={markSize} rx="9" fill="url(#sheba-grad)" />

        {/* Lucide heart-handshake icon scaled & centered in mark box */}
        <g
          transform={`translate(${iconPad}, ${iconPad}) scale(${iconScale})`}
          fill="none"
          stroke="#ffffff"
          strokeWidth={2 / iconScale}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Heart outline */}
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          {/* Handshake gesture inside */}
          <path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08c.82.82 2.13.85 3 .07l2.07-1.9a2.82 2.82 0 0 1 3.79 0l2.96 2.66" />
          <path d="m18 15-2-2" />
          <path d="m15 18-2-2" />
        </g>

        {/* Wordmark */}
        {showText && (
          <text
            x={wordmarkX}
            y={totalH / 2 + textSize * 0.36}
            fontFamily="'Bricolage Grotesque', system-ui, sans-serif"
            fontSize={textSize}
            fontWeight="700"
            letterSpacing="-0.4"
            fill={textColor}
          >
            ShebaBD
          </text>
        )}
      </svg>
    </span>
  );
}
