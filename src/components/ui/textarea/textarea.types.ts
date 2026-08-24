import type { TextareaHTMLAttributes } from 'react';

// ─── Size & State Tokens ───────────────────────────────────────────────────────

/** Visual sizes available for the Textarea component */
export type TextareaSize = 'sm' | 'md' | 'lg';

/** Validation / visual state of the textarea */
export type TextareaState = 'default' | 'success' | 'error';

/**
 * Controls whether and how the user can manually resize the textarea.
 * When `autoResize` is true this is forced to 'none' — JS manages the height.
 */
export type TextareaResize = 'none' | 'vertical' | 'horizontal' | 'both';

// ─── Component Props ───────────────────────────────────────────────────────────

export type TextareaProps = {
  // ── Layout / wrapper ────────────────────────────────────────────────────────

  /** Visible label rendered above the textarea */
  label?: string;

  /** Secondary descriptive text rendered below the textarea */
  helperText?: string;

  /**
   * Error message shown below the textarea when inputState === 'error'.
   * Takes priority over helperText.
   */
  errorMessage?: string;

  /**
   * Controls border colour, focus ring colour, and footer text colour.
   * @default 'default'
   */
  inputState?: TextareaState;

  /**
   * Controls padding, font size and min-height.
   * @default 'md'
   */
  size?: TextareaSize;

  /** Stretch the wrapper and textarea to 100 % of the parent width */
  fullWidth?: boolean;

  /** Marks the field as required — adds a red asterisk after the label */
  required?: boolean;

  /**
   * Marks the field as optional — adds a muted "(optional)" badge after the label.
   * Ignored when `required` is also true.
   */
  optional?: boolean;

  // ── Textarea-specific features ───────────────────────────────────────────────

  /**
   * When true, the textarea grows automatically with its content.
   * Forces `resize` to 'none' — height is managed by JS.
   * @default false
   */
  autoResize?: boolean;

  /**
   * Minimum number of visible rows.
   * Used to set the initial `rows` HTML attribute.
   * @default 3
   */
  minRows?: number;

  /**
   * Maximum number of rows before the textarea stops growing and shows a
   * scrollbar. Only meaningful when `autoResize` is true.
   * When undefined the textarea grows without bound.
   */
  maxRows?: number;

  /**
   * Manual resize handle direction shown to the user.
   * Ignored (forced to 'none') when `autoResize` is true.
   * @default 'vertical'
   */
  resize?: TextareaResize;

  /**
   * When true and `maxLength` is set, renders a live character counter
   * in the bottom-right corner of the textarea wrapper.
   * Automatically enabled when `maxLength` is provided.
   * @default false
   */
  showCount?: boolean;

  // ── className overrides ──────────────────────────────────────────────────────

  /** Extra classes on the outermost wrapper div */
  wrapperClassName?: string;

  /** Extra classes on the <label> element */
  labelClassName?: string;

  /** Extra classes on the <textarea> element */
  textareaClassName?: string;

  /** Extra classes on the helper / error text <p> element */
  helperClassName?: string;
} & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>;
// `size` is omitted so our TextareaSize union does not clash with the native
// HTML attribute that accepts a number.
