import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';

export interface DockItem {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  className?: string;
  isActive?: boolean;
}

export interface DockProps {
  items: DockItem[];
  panelHeight?: number;
  baseItemSize?: number;
  magnification?: number;
  distance?: number;
  className?: string;
  position?: 'bottom' | 'top';
}

function DockItemComponent({
  item,
  mouseX,
  baseItemSize = 50,
  magnification = 70,
  distance = 140,
}: {
  item: DockItem;
  mouseX: any;
  baseItemSize?: number;
  magnification?: number;
  distance?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = React.useState(false);

  const distanceCalc = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect();
    if (!bounds) return distance;
    return val - bounds.x - bounds.width / 2;
  });

  const widthSync = useTransform(
    distanceCalc,
    [-distance, 0, distance],
    [baseItemSize, magnification, baseItemSize]
  );

  const width = useSpring(widthSync, {
    mass: 0.1,
    stiffness: 170,
    damping: 12,
  });

  return (
    <div className="relative group">
      {/* Tooltip Hover Label */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.85 }}
            transition={{ duration: 0.15 }}
            className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 rounded-md text-xs font-mono font-medium shadow-xl pointer-events-none whitespace-nowrap z-50"
            style={{
              background: 'rgba(15, 58, 43, 0.92)',
              color: '#F7F1E1',
              border: '1px solid rgba(247, 241, 225, 0.2)',
              backdropFilter: 'blur(8px)',
            }}>
            {item.label}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Dock Item */}
      <motion.div
        ref={ref}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={item.onClick}
        whileTap={{ scale: 0.9 }}
        className={`flex items-center justify-center rounded-2xl cursor-pointer relative transition-all ${item.className || ''}`}
        style={{
          width,
          height: width,
          background: 'linear-gradient(135deg, rgba(247, 241, 225, 0.12) 0%, rgba(247, 241, 225, 0.04) 100%)',
          border: '1px solid rgba(247, 241, 225, 0.18)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
          backdropFilter: 'blur(12px)',
        }}>
        <div className="flex items-center justify-center text-[#F7F1E1] transition-transform duration-150">
          {item.icon}
        </div>

        {/* Active Indicator Dot */}
        {item.isActive && (
          <span
            className="absolute -bottom-1 w-1.5 h-1.5 rounded-full"
            style={{ background: '#E7A93B', boxShadow: '0 0 8px #E7A93B' }}
          />
        )}
      </motion.div>
    </div>
  );
}

export function Dock({
  items,
  panelHeight = 68,
  baseItemSize = 50,
  magnification = 70,
  distance = 140,
  className = '',
  position = 'bottom',
}: DockProps) {
  const mouseX = useMotionValue(Infinity);

  return (
    <div
      className={`fixed ${position === 'bottom' ? 'bottom-6' : 'top-6'} left-1/2 -translate-x-1/2 z-50 flex items-center justify-center ${className}`}>
      <motion.div
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className="flex items-center gap-3 px-4 rounded-3xl"
        style={{
          height: panelHeight,
          background: 'rgba(11, 46, 34, 0.75)',
          border: '1px solid rgba(247, 241, 225, 0.15)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(16px)',
        }}>
        {items.map((item, index) => (
          <DockItemComponent
            key={index}
            item={item}
            mouseX={mouseX}
            baseItemSize={baseItemSize}
            magnification={magnification}
            distance={distance}
          />
        ))}
      </motion.div>
    </div>
  );
}

export default Dock;
