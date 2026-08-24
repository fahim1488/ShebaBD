import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  DEFAULT_THEME,
  getStoredTheme,
  getSystemTheme,
  THEME_STORAGE_KEY,
  type Theme,
} from '@/constants/theme';
import { colorPalettes } from '@/constants/tokens';
import { ThemeContext } from './ThemeContext';

function resolveInitialTheme(): Theme {
  return getStoredTheme() ?? getSystemTheme() ?? DEFAULT_THEME;
}

function applyTheme(theme: Theme): void {
  const palette = colorPalettes[theme];
  const root = document.documentElement;

  root.setAttribute('data-theme', theme);
  root.classList.toggle('dark', theme === 'dark');

  Object.entries(palette).forEach(([token, value]) => {
    root.style.setProperty(`--ds-color-${token}`, value);
  });
}

type ThemeProviderProps = {
  children: ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(resolveInitialTheme);

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = useCallback((nextTheme: Theme) => {
    setThemeState(nextTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => (current === 'light' ? 'dark' : 'light'));
  }, []);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme,
      isDark: theme === 'dark',
    }),
    [theme, setTheme, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
