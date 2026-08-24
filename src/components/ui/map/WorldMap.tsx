/**
 * WorldMap — adapted from the shadcn/aceternity WorldMap component.
 *
 * Changes from the original (Next.js) version:
 *  - Removed `next/image`   → plain <img> tag
 *  - Removed `next-themes`  → uses the existing ShebaBD useTheme() hook
 *  - Removed "use client"   → not needed in Vite/React
 *  - Fixed template-literal JSX backtick syntax (original had a typo)
 */

import { useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DottedMap from 'dotted-map';
import { useTheme } from '@/hooks/useTheme';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MapDot {
  start: { lat: number; lng: number; label?: string };
  end: { lat: number; lng: number; label?: string };
}

interface WorldMapProps {
  dots?: MapDot[];
  lineColor?: string;
  showLabels?: boolean;
  animationDuration?: number;
  loop?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function WorldMap({
  dots = [],
  lineColor = '#16A34A', // ds-primary green — matches ShebaBD brand
  showLabels = true,
  animationDuration = 2,
  loop = true,
}: WorldMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);
  const { isDark } = useTheme();

  // Build the dotted-map SVG once (expensive — memo it)
  const map = useMemo(() => new DottedMap({ height: 100, grid: 'diagonal' }), []);

  const svgMap = useMemo(
    () =>
      map.getSVG({
        radius: 0.22,
        color: isDark ? '#FFFF7F40' : '#00000040',
        shape: 'circle',
        backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
      }),
    [map, isDark],
  );

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const projectPoint = (lat: number, lng: number) => ({
    x: (lng + 180) * (800 / 360),
    y: (90 - lat) * (400 / 180),
  });

  const createCurvedPath = (
    start: { x: number; y: number },
    end: { x: number; y: number },
  ) => {
    const midX = (start.x + end.x) / 2;
    const midY = Math.min(start.y, end.y) - 50;
    return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;
  };

  // ── Animation timing ────────────────────────────────────────────────────────

  const staggerDelay = 0.3;
  const totalAnimationTime = dots.length * staggerDelay + animationDuration;
  const pauseTime = 2;
  const fullCycleDuration = totalAnimationTime + pauseTime;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="relative w-full overflow-hidden rounded-ds-xl font-sans dark:bg-ds-background bg-white aspect-[2/1] md:aspect-[2.5/1] lg:aspect-[2/1]">
      {/* Dotted base map */}
      <img
        src={`data:image/svg+xml;utf8,${encodeURIComponent(svgMap)}`}
        className="pointer-events-none h-full w-full select-none object-cover [mask-image:linear-gradient(to_bottom,transparent,white_10%,white_90%,transparent)]"
        alt="world map"
        draggable={false}
      />

      {/* SVG overlay — paths + dots */}
      <svg
        ref={svgRef}
        viewBox="0 0 800 400"
        className="absolute inset-0 h-full w-full select-none pointer-events-auto"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="path-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="5%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="95%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>

          <filter id="glow">
            <feMorphology operator="dilate" radius="0.5" />
            <feGaussianBlur stdDeviation="1" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ── Animated paths ─────────────────────────────────────────────── */}
        {dots.map((dot, i) => {
          const startPoint = projectPoint(dot.start.lat, dot.start.lng);
          const endPoint = projectPoint(dot.end.lat, dot.end.lng);
          const pathD = createCurvedPath(startPoint, endPoint);

          const startTime = (i * staggerDelay) / fullCycleDuration;
          const endTime = (i * staggerDelay + animationDuration) / fullCycleDuration;
          const resetTime = totalAnimationTime / fullCycleDuration;

          return (
            <g key={`path-group-${i}`}>
              <motion.path
                d={pathD}
                fill="none"
                stroke="url(#path-gradient)"
                strokeWidth="1"
                initial={{ pathLength: 0 }}
                animate={
                  loop
                    ? { pathLength: [0, 0, 1, 1, 0] }
                    : { pathLength: 1 }
                }
                transition={
                  loop
                    ? {
                        duration: fullCycleDuration,
                        times: [0, startTime, endTime, resetTime, 1],
                        ease: 'easeInOut',
                        repeat: Infinity,
                        repeatDelay: 0,
                      }
                    : {
                        duration: animationDuration,
                        delay: i * staggerDelay,
                        ease: 'easeInOut',
                      }
                }
              />

              {/* Travelling dot along the path */}
              {loop && (
                <motion.circle
                  r="4"
                  fill={lineColor}
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: [0, 0, 1, 0, 0],
                  }}
                  transition={{
                    duration: fullCycleDuration,
                    times: [0, startTime, endTime, resetTime, 1],
                    ease: 'easeInOut',
                    repeat: Infinity,
                    repeatDelay: 0,
                  }}
                  style={{
                    offsetPath: `path('${pathD}')`,
                    offsetDistance: '50%',
                  }}
                />
              )}
            </g>
          );
        })}

        {/* ── Location dots + labels ─────────────────────────────────────── */}
        {dots.map((dot, i) => {
          const startPoint = projectPoint(dot.start.lat, dot.start.lng);
          const endPoint = projectPoint(dot.end.lat, dot.end.lng);

          return (
            <g key={`points-group-${i}`}>
              {/* Start point */}
              <motion.g
                onHoverStart={() =>
                  setHoveredLocation(dot.start.label ?? `Location ${i + 1}`)
                }
                onHoverEnd={() => setHoveredLocation(null)}
                className="cursor-pointer"
                whileHover={{ scale: 1.3 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              >
                <circle
                  cx={startPoint.x}
                  cy={startPoint.y}
                  r="3"
                  fill={lineColor}
                  filter="url(#glow)"
                />
                {/* Pulsing ring */}
                <circle
                  cx={startPoint.x}
                  cy={startPoint.y}
                  r="3"
                  fill={lineColor}
                  opacity="0.5"
                >
                  <animate attributeName="r" from="3" to="12" dur="2s" begin="0s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.6" to="0" dur="2s" begin="0s" repeatCount="indefinite" />
                </circle>
              </motion.g>

              {showLabels && dot.start.label && (
                <motion.g
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 * i + 0.3, duration: 0.5 }}
                  className="pointer-events-none"
                >
                  <foreignObject
                    x={startPoint.x - 50}
                    y={startPoint.y - 36}
                    width="100"
                    height="28"
                  >
                    <div className="flex h-full items-center justify-center">
                      <span className="rounded-md border border-gray-200 bg-white/95 px-2 py-0.5 text-xs font-medium text-black shadow-sm dark:border-gray-700 dark:bg-black/95 dark:text-white">
                        {dot.start.label}
                      </span>
                    </div>
                  </foreignObject>
                </motion.g>
              )}

              {/* End point */}
              <motion.g
                onHoverStart={() =>
                  setHoveredLocation(dot.end.label ?? `Destination ${i + 1}`)
                }
                onHoverEnd={() => setHoveredLocation(null)}
                className="cursor-pointer"
                whileHover={{ scale: 1.3 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              >
                <circle
                  cx={endPoint.x}
                  cy={endPoint.y}
                  r="3"
                  fill={lineColor}
                  filter="url(#glow)"
                />
                <circle
                  cx={endPoint.x}
                  cy={endPoint.y}
                  r="3"
                  fill={lineColor}
                  opacity="0.5"
                >
                  <animate attributeName="r" from="3" to="12" dur="2s" begin="0.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.6" to="0" dur="2s" begin="0.5s" repeatCount="indefinite" />
                </circle>
              </motion.g>

              {showLabels && dot.end.label && (
                <motion.g
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 * i + 0.5, duration: 0.5 }}
                  className="pointer-events-none"
                >
                  <foreignObject
                    x={endPoint.x - 50}
                    y={endPoint.y - 36}
                    width="100"
                    height="28"
                  >
                    <div className="flex h-full items-center justify-center">
                      <span className="rounded-md border border-gray-200 bg-white/95 px-2 py-0.5 text-xs font-medium text-black shadow-sm dark:border-gray-700 dark:bg-black/95 dark:text-white">
                        {dot.end.label}
                      </span>
                    </div>
                  </foreignObject>
                </motion.g>
              )}
            </g>
          );
        })}
      </svg>

      {/* Mobile hover tooltip */}
      <AnimatePresence>
        {hoveredLocation && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-4 left-4 rounded-ds-lg border border-gray-200 bg-white/90 px-3 py-2 text-sm font-medium text-black backdrop-blur-sm dark:border-gray-700 dark:bg-black/90 dark:text-white sm:hidden"
          >
            {hoveredLocation}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
