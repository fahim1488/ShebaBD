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
      keyframes: animations.keyframes,
      animation: {
        'ds-fade-in': 'fadeIn var(--ds-transition-normal) var(--ds-easing-out) forwards',
        'ds-fade-out': 'fadeOut var(--ds-transition-normal) var(--ds-easing-in) forwards',
        'ds-slide-up': 'slideUp var(--ds-transition-normal) var(--ds-easing-out) forwards',
        'ds-slide-down': 'slideDown var(--ds-transition-normal) var(--ds-easing-out) forwards',
        'ds-scale-in': 'scaleIn var(--ds-transition-fast) var(--ds-easing-out) forwards',
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
