import { cva } from 'class-variance-authority';

// ─── Wrapper ───────────────────────────────────────────────────────────────────

/**
 * The outermost container div.
 * Only controls width — everything else lives in child layers.
 */
export const inputWrapperVariants = cva('flex flex-col gap-1', {
  variants: {
    fullWidth: {
      true: 'w-full',
      false: 'w-fit',
    },
  },
  defaultVariants: {
    fullWidth: false,
  },
});

// ─── Field Container ───────────────────────────────────────────────────────────

/**
 * The div that wraps the icon(s) + <input> together.
 * Uses `relative` so icons / spinner can be absolutely positioned.
 */
export const inputFieldContainerVariants = cva('relative flex items-center', {
  variants: {
    fullWidth: {
      true: 'w-full',
      false: '',
    },
  },
  defaultVariants: {
    fullWidth: false,
  },
});

// ─── Input Element ─────────────────────────────────────────────────────────────

/**
 * Applied directly to the <input> HTML element.
 *
 * State drives border colour and focus ring colour.
 * Size drives height, horizontal padding, and font size.
 *
 * Important conventions:
 * - No `outline` — we manage focus rings via Tailwind `focus:ring-*`
 * - `peer` class enables CSS peer selectors on sibling icons if ever needed
 */
export const inputElementVariants = cva(
  [
    // Layout
    'peer w-full rounded-ds-md',
    // Typography
    'font-sans text-ds-foreground placeholder:text-ds-muted/60',
    // Background
    'bg-ds-surface dark:bg-neutral-900',
    // Border base
    'border transition-all duration-ds-fast ease-ds-default',
    // Focus
    'focus:outline-none focus:ring-2 focus:ring-offset-1',
    'focus:ring-offset-ds-background dark:focus:ring-offset-neutral-900',
    // Disabled
    'disabled:cursor-not-allowed disabled:opacity-50',
    'disabled:bg-neutral-100 dark:disabled:bg-neutral-800',
    // Read-only
    'read-only:cursor-default read-only:select-all',
    'read-only:bg-neutral-50 dark:read-only:bg-neutral-900/50',
    // Loading
    'data-[loading=true]:pointer-events-none',
  ],
  {
    variants: {
      // ── size ──────────────────────────────────────────────────────────────
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-3.5 text-sm',
        lg: 'h-12 px-4 text-base',
      },
      // ── inputState ────────────────────────────────────────────────────────
      inputState: {
        default: [
          'border-neutral-300 dark:border-neutral-600',
          'hover:border-neutral-400 dark:hover:border-neutral-500',
          'focus:border-ds-primary focus:ring-ds-primary',
        ],
        success: [
          'border-ds-success',
          'focus:border-ds-success focus:ring-ds-success',
        ],
        error: [
          'border-ds-danger',
          'hover:border-ds-danger',
          'focus:border-ds-danger focus:ring-ds-danger',
        ],
      },
      // ── padding overrides when icons / clear / spinner are present ────────
      hasPrefixIcon: {
        true: '',
        false: '',
      },
      hasSuffixSlot: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      // sm + prefix icon → extra left padding
      { size: 'sm', hasPrefixIcon: true, class: 'pl-8' },
      { size: 'md', hasPrefixIcon: true, class: 'pl-10' },
      { size: 'lg', hasPrefixIcon: true, class: 'pl-11' },
      // sm + suffix slot (icon / spinner / clear / eye toggle) → extra right padding
      { size: 'sm', hasSuffixSlot: true, class: 'pr-8' },
      { size: 'md', hasSuffixSlot: true, class: 'pr-10' },
      { size: 'lg', hasSuffixSlot: true, class: 'pr-11' },
    ],
    defaultVariants: {
      size: 'md',
      inputState: 'default',
      hasPrefixIcon: false,
      hasSuffixSlot: false,
    },
  },
);

// ─── Label ─────────────────────────────────────────────────────────────────────

/**
 * The <label> element above the input.
 * Font size scales with the input size so the visual hierarchy stays coherent.
 */
export const inputLabelVariants = cva(
  'block font-medium text-ds-foreground leading-none mb-1.5',
  {
    variants: {
      size: {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-sm',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

// ─── Icon / Slot sizing ────────────────────────────────────────────────────────

/** Pixel sizes for prefix/suffix Lucide icons, keyed by InputSize */
export const inputIconSizes: Record<'sm' | 'md' | 'lg', number> = {
  sm: 14,
  md: 16,
  lg: 18,
};

/**
 * Shared classes for the icon wrapper spans (prefix and suffix).
 * Uses pointer-events-none so clicks fall through to the input.
 */
export const inputIconWrapperBase =
  'absolute inset-y-0 flex items-center pointer-events-none text-ds-muted';

/** Specific to the leading (left) icon */
export const prefixIconWrapper = `${inputIconWrapperBase} left-3`;

/** Specific to the trailing (right) slot — buttons need pointer-events-auto override */
export const suffixIconWrapper =
  'absolute inset-y-0 right-0 flex items-center pr-3';

// ─── Helper / Error text ───────────────────────────────────────────────────────

/**
 * The small text rendered below the input field.
 * Colour reflects the current inputState.
 */
export const inputHelperVariants = cva('text-xs mt-1.5 leading-tight', {
  variants: {
    inputState: {
      default: 'text-ds-muted',
      success: 'text-ds-success',
      error: 'text-ds-danger',
    },
  },
  defaultVariants: {
    inputState: 'default',
  },
});
