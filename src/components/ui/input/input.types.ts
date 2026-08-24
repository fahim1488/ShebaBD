import type { InputHTMLAttributes } from 'react';
import type { LucideIcon } from 'lucide-react';

// ─── Size & State Tokens ───────────────────────────────────────────────────────

/** Visual sizes available for all input components */
export type InputSize = 'sm' | 'md' | 'lg';

/** Validation / visual state of the input */
export type InputState = 'default' | 'success' | 'error';

// ─── Shared Base Props ─────────────────────────────────────────────────────────

/**
 * BaseInputProps is the single source of truth for all props shared across
 * TextInput, PasswordInput, and SearchInput. Each specialised component
 * extends or omits fields as needed.
 */
export type BaseInputProps = {
  /** Visible label rendered above the input field */
  label?: string;

  /** Secondary descriptive text rendered below the input */
  helperText?: string;

  /**
   * Error message rendered below the input when inputState === 'error'.
   * Takes priority over helperText when both are supplied.
   */
  errorMessage?: string;

  /**
   * Controls border colour, focus ring colour, and footer text colour.
   * @default 'default'
   */
  inputState?: InputState;

  /**
   * Controls height, padding, font size, and icon sizing.
   * @default 'md'
   */
  size?: InputSize;

  /** Stretch the wrapper and input to 100% of the parent width */
  fullWidth?: boolean;

  /** Lucide icon rendered on the leading (left) side of the input */
  prefixIcon?: LucideIcon;

  /** Lucide icon rendered on the trailing (right) side of the input */
  suffixIcon?: LucideIcon;

  /**
   * When true, replaces suffixIcon with an animated Loader2 spinner,
   * and sets pointer-events-none on the input so the user cannot type.
   */
  loading?: boolean;

  /**
   * When true and the input has a value, renders an ✕ icon button that
   * clears the current value when clicked.
   * The clear button appears to the right; it is hidden when the input is empty.
   */
  clearable?: boolean;

  /** Marks the field as required — adds a red asterisk after the label */
  required?: boolean;

  /**
   * Marks the field as optional — adds a muted "(optional)" badge after the label.
   * Ignored when `required` is also true.
   */
  optional?: boolean;

  // ─── className overrides ───────────────────────────────────────────────────

  /** Extra classes applied to the outermost wrapper div */
  wrapperClassName?: string;

  /** Extra classes applied to the <label> element */
  labelClassName?: string;

  /** Extra classes applied to the <input> element */
  inputClassName?: string;

  /** Extra classes applied to the helper/error text <p> element */
  helperClassName?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>;
// We omit native `size` so our InputSize union does not conflict with the
// native HTML attribute (which accepts a number, not 'sm' | 'md' | 'lg').
