export const fontFamilies = {
  sans: ['Inter', 'system-ui', 'sans-serif'],
  display: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
} as const;

export type TypographyVariant =
  | 'display'
  | 'heading'
  | 'title'
  | 'subtitle'
  | 'body'
  | 'caption'
  | 'button'
  | 'label';

export type TypographyToken = {
  fontFamily: keyof typeof fontFamilies;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  letterSpacing: string;
};

export const typography: Record<TypographyVariant, TypographyToken> = {
  display: {
    fontFamily: 'display',
    fontSize: '3.5rem',
    fontWeight: '700',
    lineHeight: '1.1',
    letterSpacing: '-0.02em',
  },
  heading: {
    fontFamily: 'display',
    fontSize: '2.25rem',
    fontWeight: '600',
    lineHeight: '1.2',
    letterSpacing: '-0.01em',
  },
  title: {
    fontFamily: 'display',
    fontSize: '1.5rem',
    fontWeight: '600',
    lineHeight: '1.3',
    letterSpacing: '0',
  },
  subtitle: {
    fontFamily: 'sans',
    fontSize: '1.25rem',
    fontWeight: '500',
    lineHeight: '1.4',
    letterSpacing: '0',
  },
  body: {
    fontFamily: 'sans',
    fontSize: '1rem',
    fontWeight: '400',
    lineHeight: '1.5',
    letterSpacing: '0',
  },
  caption: {
    fontFamily: 'sans',
    fontSize: '0.875rem',
    fontWeight: '400',
    lineHeight: '1.4',
    letterSpacing: '0',
  },
  button: {
    fontFamily: 'sans',
    fontSize: '0.875rem',
    fontWeight: '600',
    lineHeight: '1',
    letterSpacing: '0.025em',
  },
  label: {
    fontFamily: 'sans',
    fontSize: '0.75rem',
    fontWeight: '500',
    lineHeight: '1.3',
    letterSpacing: '0.05em',
  },
};
