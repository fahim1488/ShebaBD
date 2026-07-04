import { cva, type VariantProps } from 'class-variance-authority';

export const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-ds-1 whitespace-nowrap',
    'ds-button-text font-semibold',
    'transition-all duration-ds-fast ease-ds-default',
    'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900 focus:outline-none',
    'disabled:pointer-events-none disabled:opacity-50',
    'active:scale-[0.98]',
    'select-none',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-ds-primary text-white',
          'hover:brightness-95',
          'active:brightness-90',
          'focus-visible:ring-ds-primary',
        ],
        secondary: [
          'bg-ds-secondary text-white',
          'hover:brightness-95',
          'active:brightness-90',
          'focus-visible:ring-ds-secondary',
        ],
        outline: [
          'border border-ds-primary bg-transparent text-ds-primary',
          'hover:bg-ds-primary hover:text-white',
          'active:brightness-90',
          'focus-visible:ring-ds-primary',
        ],
        ghost: [
          'bg-transparent text-ds-foreground',
          'hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-ds-primary',
          'active:bg-neutral-200 dark:active:bg-neutral-700',
          'focus-visible:ring-ds-foreground',
        ],
        success: [
          'bg-ds-success text-white',
          'hover:brightness-95',
          'active:brightness-90',
          'focus-visible:ring-ds-success',
        ],
        warning: [
          'bg-ds-warning text-white',
          'hover:brightness-95',
          'active:brightness-90',
          'focus-visible:ring-ds-warning',
        ],
        danger: [
          'bg-ds-danger text-white',
          'hover:brightness-95',
          'active:brightness-90',
          'focus-visible:ring-ds-danger',
        ],
      },
      size: {
        xs: 'h-7 px-ds-2 text-ds-caption',
        sm: 'h-8 px-ds-2 text-ds-caption',
        md: 'h-10 px-ds-3 text-ds-button-text',
        lg: 'h-11 px-ds-4 text-ds-subtitle',
        xl: 'h-12 px-ds-5 text-ds-subtitle',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
      rounded: {
        true: 'rounded-ds-full',
        false: '',
      },
      iconOnly: {
        true: 'aspect-square p-0 justify-center',
        false: '',
      },
    },
    compoundVariants: [
      // Icon only sizes
      { iconOnly: true, size: 'xs', class: 'h-7 w-7 min-w-7 p-0' },
      { iconOnly: true, size: 'sm', class: 'h-8 w-8 min-w-8 p-0' },
      { iconOnly: true, size: 'md', class: 'h-10 w-10 min-w-10 p-0' },
      { iconOnly: true, size: 'lg', class: 'h-11 w-11 min-w-11 p-0' },
      { iconOnly: true, size: 'xl', class: 'h-12 w-12 min-w-12 p-0' },
      // Default rounding when rounded is false
      { rounded: false, size: 'xs', class: 'rounded-ds-sm' },
      { rounded: false, size: 'sm', class: 'rounded-ds-sm' },
      { rounded: false, size: 'md', class: 'rounded-ds-md' },
      { rounded: false, size: 'lg', class: 'rounded-ds-md' },
      { rounded: false, size: 'xl', class: 'rounded-ds-lg' },
    ],
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
      rounded: false,
      iconOnly: false,
    },
  },
);

export type ButtonVariant = NonNullable<
  VariantProps<typeof buttonVariants>['variant']
>;

export type ButtonSize = NonNullable<
  VariantProps<typeof buttonVariants>['size']
>;

export const buttonIconSizes: Record<ButtonSize, number> = {
  xs: 14,
  sm: 16,
  md: 18,
  lg: 20,
  xl: 22,
};
