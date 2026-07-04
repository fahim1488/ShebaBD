export type ColorPalette = {
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  background: string;
  surface: string;
  foreground: string;
  muted: string;
};

export const lightColors: ColorPalette = {
  primary: '#16A34A',
  secondary: '#2563EB',
  accent: '#0EA5E9',
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  foreground: '#0F172A',
  muted: '#64748B',
};

export const darkColors: ColorPalette = {
  primary: '#16A34A',
  secondary: '#2563EB',
  accent: '#0EA5E9',
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
  background: '#0F172A',
  surface: '#1E293B',
  foreground: '#F8FAFC',
  muted: '#94A3B8',
};

export const colorPalettes = {
  light: lightColors,
  dark: darkColors,
} as const;

export type ColorToken = keyof ColorPalette;
