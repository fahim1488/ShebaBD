import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { LanguageContext, type Lang } from './LanguageContext';
import { en } from '@/i18n/en';
import { bn } from '@/i18n/bn';

const LANG_KEY = 'shebabd-lang';
const TRANSLATIONS = { en, bn } as const;

function getStoredLang(): Lang | null {
  try {
    const v = localStorage.getItem(LANG_KEY);
    if (v === 'en' || v === 'bn') return v;
  } catch {}
  return null;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => getStoredLang() ?? 'en');

  // Persist + set <html lang> attribute
  useEffect(() => {
    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.lang = lang === 'bn' ? 'bn' : 'en';
  }, [lang]);

  const setLang = useCallback((l: Lang) => setLangState(l), []);
  const toggleLang = useCallback(() => setLangState(c => (c === 'en' ? 'bn' : 'en')), []);

  const value = useMemo(
    () => ({ lang, t: TRANSLATIONS[lang], setLang, toggleLang }),
    [lang, setLang, toggleLang],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
