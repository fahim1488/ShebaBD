# ShebaBD Localization (i18n) & Translation Guide

## Language Support
- English (`en`): Default international locale
- Bengali (`bn`): Localized terminology and Bangla numeral formatting

## Adding Translation Keys
1. Add new keys in `src/i18n/en.ts`
2. Add corresponding Bengali strings in `src/i18n/bn.ts`
3. Consume via `useLanguage()` hook in React components
