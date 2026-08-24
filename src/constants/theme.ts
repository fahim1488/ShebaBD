export const THEME_STORAGE_KEY = 'shebabd-theme';

export type Theme = 'light' | 'dark';

export const THEMES: readonly Theme[] = ['light', 'dark'] as const;

export const DEFAULT_THEME: Theme = 'light';

export function isTheme(value: string | null): value is Theme {
  return value === 'light' || value === 'dark';
}

export function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export function getStoredTheme(): Theme | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return isTheme(stored) ? stored : null;
}
