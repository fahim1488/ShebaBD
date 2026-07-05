import { cva } from 'class-variance-authority';
import type { TextareaResize, TextareaSize } from './textarea.types';

// ─── Wrapper ───────────────────────────────────────────────────────────────────

/**
 * Outermost container — controls width only.
 * All visual styling lives in the child layers.
 */
export const textareaWrapperVariants = cva('flex flex-col gap-1', {
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

// ─── Textarea Element ──────────────────────────────────────────────────────────

/**
 * Applied directly to the <textarea> HTML element.
 *
 * Conventions — mirror the Input component exactly:
 * - No `outline`; focus rings managed via `focus:ring-*`
 * - `transition-all` ensures smooth border/shadow changes
 * - Disabled, read-only and loading states use data attributes / pseudo-selectors
 */
export const textareaElementVariants = cva(
  [
    // Layout
    'w-full rounded-ds-md',
    // Typography
    'font-sans leading-relaxed text-ds-foreground placeholder:text-ds-muted/60',
    // Background
    'bg-ds-surface dark:bg-neutral-900',
    // Border
    'border transition-all duration-ds-fast ease-ds-default',
    // Focus ring
    'focus:outline-none focus:ring-2 focus:ring-offset-1',
    'focus:ring-offset-ds-background dark:focus:ring-offset-neutral-900',
    // Disabled
    'disabled:cursor-not-allowed disabled:opacity-50',
    'disabled:bg-neutral-100 dark:disabled:bg-neutral-800',
    // Read-only
    'read-only:cursor-default',
    'read-only:bg-neutral-50 dark:read-only:bg-neutral-900/50',
  ],
  {
    variants: {
      // ── size ─────────────────────────────────────────────────────────────
      size: {
        sm: 'min-h-[80px] px-3 py-2 text-sm',
        md: 'min-h-[100px] px-3.5 py-2.5 text-sm',
        lg: 'min-h-[128px] px-4 py-3 text-base',
      },
      // ── inputState ───────────────────────────────────────────────────────
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
    },
    defaultVariants: {
      size: 'md',
      inputState: 'default',
    },
  },
);

// ─── Label ─────────────────────────────────────────────────────────────────────

/**
 * <label> above the textarea.
 * Font size scales with the component size for coherent visual hierarchy.
 */
export const textareaLabelVariants = cva(
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

// ─── Helper / Error text ───────────────────────────────────────────────────────

/**
 * Footer text below the textarea.
 * Colour reflects the current inputState.
 */
export const textareaHelperVariants = cva('text-xs leading-tight', {
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

// ─── Character counter colour ─────────────────────────────────────────────────

/**
 * Returns a Tailwind colour class for the character counter based on
 * how close the current length is to the maximum.
 *
 * < 80 %  → muted
 * 80–99 % → warning
 * 100 %+  → danger
 */
export function getCounterColorClass(
  current: number,
  max: number,
): string {
  const ratio = current / max;
  if (ratio >= 1) return 'text-ds-danger font-semibold';
  if (ratio >= 0.8) return 'text-ds-warning font-medium';
  return 'text-ds-muted';
}

// ─── Resize CSS class map ─────────────────────────────────────────────────────

/**
 * Maps the `resize` prop to the corresponding Tailwind CSS class.
 * When autoResize is active, always use 'resize-none'.
 */
export const resizeClassMap: Record<TextareaResize, string> = {
  none: 'resize-none',
  vertical: 'resize-y',
  horizontal: 'resize-x',
  both: 'resize',
};

// ─── Convenience size → row-height map ───────────────────────────────────────

/**
 * Approximate line-height in pixels for each size variant.
 * Used by autoResize to calculate maxRows cap.
 * Values are based on text-sm (20px) / text-base (24px) with relaxed leading.
 */
export const sizeLineHeights: Record<TextareaSize, number> = {
  sm: 20,
  md: 20,
  lg: 24,
};

/**
 * Approximate vertical padding in pixels for each size variant (top + bottom).
 * Used alongside lineHeight to compute the maxRows pixel cap.
 */
export const sizePaddingY: Record<TextareaSize, number> = {
  sm: 16, // py-2 = 8px × 2
  md: 20, // py-2.5 = 10px × 2
  lg: 24, // py-3 = 12px × 2
};
