import type { Config } from 'tailwindcss';
import daisyui from 'daisyui';
import {
  animations,
  fontFamilies,
  radius,
  shadows,
  spacing,
  transitions,
  typography,
} from './src/constants/tokens';

const dsColors = {
  primary: 'var(--ds-color-primary)',
  secondary: 'var(--ds-color-secondary)',
  accent: 'var(--ds-color-accent)',
  success: 'var(--ds-color-success)',
  warning: 'var(--ds-color-warning)',
  danger: 'var(--ds-color-danger)',
  info: 'var(--ds-color-info)',
  background: 'var(--ds-color-background)',
  surface: 'var(--ds-color-surface)',
  foreground: 'var(--ds-color-foreground)',
  muted: 'var(--ds-color-muted)',
};

const dsSpacing = Object.fromEntries(
  Object.entries(spacing).map(([key, value]) => [`ds-${key}`, value]),
);

const dsRadius = Object.fromEntries(
  Object.entries(radius).map(([key, value]) => [`ds-${key}`, value]),
);

const dsShadows = Object.fromEntries(
  Object.entries(shadows).map(([key, value]) => [`ds-${key}`, value]),
);

const dsFontSize = Object.fromEntries(
  Object.entries(typography).map(([key, token]) => [
    `ds-${key}`,
    [
      token.fontSize,
      {
        lineHeight: token.lineHeight,
        fontWeight: token.fontWeight,
        letterSpacing: token.letterSpacing,
      },
    ],
  ]),
);

const daisyLightTheme = {
  primary: '#16A34A',
  secondary: '#2563EB',
  accent: '#0EA5E9',
  neutral: '#0F172A',
  'base-100': '#F8FAFC',
  'base-200': '#F1F5F9',
  'base-300': '#E2E8F0',
  info: '#3B82F6',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
};

const daisyDarkTheme = {
  primary: '#16A34A',
  secondary: '#2563EB',
  accent: '#0EA5E9',
  neutral: '#F8FAFC',
  'base-100': '#0F172A',
  'base-200': '#1E293B',
  'base-300': '#334155',
  info: '#3B82F6',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
};

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: spacing[2],
        sm: spacing[3],
        lg: spacing[4],
        xl: spacing[5],
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        ds: dsColors,
        ink: {
          DEFAULT: '#0B2E22',
          2: '#0F3A2B',
          3: '#123F30',
        },
        paper: '#F7F1E1',
        disc:   '#D6472C',
        marigold: '#E7A93B',
        sky:    '#3E7A8C',
        leaf:   '#4C8C6B',
      },
      fontFamily: {
        sans: fontFamilies.sans,
        display: fontFamilies.display,
      },
      fontSize: dsFontSize,
      spacing: dsSpacing,
      borderRadius: dsRadius,
      boxShadow: dsShadows,
      transitionDuration: {
        'ds-fast': transitions.duration.fast,
        'ds-normal': transitions.duration.normal,
        'ds-slow': transitions.duration.slow,
      },
      transitionTimingFunction: {
        'ds-default': transitions.easing.default,
        'ds-in': transitions.easing.in,
        'ds-out': transitions.easing.out,
        'ds-in-out': transitions.easing.inOut,
      },
      keyframes: {
        ...animations.keyframes,
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%':      { transform: 'translateY(-8px) rotate(1deg)' },
          '66%':      { transform: 'translateY(-4px) rotate(-1deg)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px 4px rgba(231,169,59,0.15)' },
          '50%':      { boxShadow: '0 0 40px 8px rgba(231,169,59,0.35)' },
        },
        borderGlow: {
          '0%, 100%': { borderColor: 'rgba(231,169,59,0.2)' },
          '50%':      { borderColor: 'rgba(231,169,59,0.6)' },
        },
        textReveal: {
          '0%':   { clipPath: 'inset(0 100% 0 0)', opacity: '0' },
          '100%': { clipPath: 'inset(0 0% 0 0)',   opacity: '1' },
        },
        slideInLeft: {
          '0%':   { transform: 'translateX(-32px)', opacity: '0' },
          '100%': { transform: 'translateX(0)',     opacity: '1' },
        },
        slideInRight: {
          '0%':   { transform: 'translateX(32px)', opacity: '0' },
          '100%': { transform: 'translateX(0)',    opacity: '1' },
        },
        scaleUp: {
          '0%':   { transform: 'scale(0.88)', opacity: '0' },
          '100%': { transform: 'scale(1)',    opacity: '1' },
        },
        morphBg: {
          '0%, 100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
          '50%':      { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%' },
        },
        gradientShift: {
          '0%':   { backgroundPosition: '0% 50%'   },
          '50%':  { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%'   },
        },
        countUp: {
          '0%':   { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
      },
      animation: {
        'ds-fade-in':    'fadeIn var(--ds-transition-normal) var(--ds-easing-out) forwards',
        'ds-fade-out':   'fadeOut var(--ds-transition-normal) var(--ds-easing-in) forwards',
        'ds-slide-up':   'slideUp var(--ds-transition-normal) var(--ds-easing-out) forwards',
        'ds-slide-down': 'slideDown var(--ds-transition-normal) var(--ds-easing-out) forwards',
        'ds-scale-in':   'scaleIn var(--ds-transition-fast) var(--ds-easing-out) forwards',
        'shimmer':       'shimmer 2.4s linear infinite',
        'float':         'float 4s ease-in-out infinite',
        'float-slow':    'floatSlow 7s ease-in-out infinite',
        'glow-pulse':    'glowPulse 2.8s ease-in-out infinite',
        'border-glow':   'borderGlow 2.4s ease-in-out infinite',
        'text-reveal':   'textReveal 0.7s cubic-bezier(0.4,0,0.2,1) forwards',
        'slide-in-left': 'slideInLeft 0.6s cubic-bezier(0.4,0,0.2,1) forwards',
        'slide-in-right':'slideInRight 0.6s cubic-bezier(0.4,0,0.2,1) forwards',
        'scale-up':      'scaleUp 0.5s cubic-bezier(0.4,0,0.2,1) forwards',
        'morph-bg':      'morphBg 8s ease-in-out infinite',
        'gradient-shift':'gradientShift 6s ease infinite',
        'count-up':      'countUp 0.5s cubic-bezier(0.4,0,0.2,1) forwards',
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        light: daisyLightTheme,
        dark: daisyDarkTheme,
      },
    ],
    darkTheme: 'dark',
    base: true,
    styled: true,
    utils: true,
  },
} satisfies Config;
