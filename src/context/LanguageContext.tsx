import { createContext } from 'react';
import { en, type Translations } from '@/i18n/en';

export type Lang = 'en' | 'bn';

export interface LanguageContextValue {
  lang: Lang;
  t: Translations;
  setLang: (l: Lang) => void;
  toggleLang: () => void;
}

export const LanguageContext = createContext<LanguageContextValue>({
  lang: 'en',
  t: en,
  setLang: () => {},
  toggleLang: () => {},
});
