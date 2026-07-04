import { transitions } from './transitions';

export const animations = {
  keyframes: {
    fadeIn: {
      from: { opacity: '0' },
      to: { opacity: '1' },
    },
    fadeOut: {
      from: { opacity: '1' },
      to: { opacity: '0' },
    },
    slideUp: {
      from: { opacity: '0', transform: 'translateY(8px)' },
      to: { opacity: '1', transform: 'translateY(0)' },
    },
    slideDown: {
      from: { opacity: '0', transform: 'translateY(-8px)' },
      to: { opacity: '1', transform: 'translateY(0)' },
    },
    scaleIn: {
      from: { opacity: '0', transform: 'scale(0.95)' },
      to: { opacity: '1', transform: 'scale(1)' },
    },
  },
  presets: {
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
    },
    slideUp: {
      initial: { opacity: 0, y: 8 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 8 },
      transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
    },
    scaleIn: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 },
      transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
    },
  },
  duration: transitions.duration,
  easing: transitions.easing,
} as const;

export type AnimationPreset = keyof typeof animations.presets;
export type AnimationKeyframe = keyof typeof animations.keyframes;
