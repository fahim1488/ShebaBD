import type { ReactNode } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
import {
  inputWrapperVariants,
  inputLabelVariants,
  inputHelperVariants,
} from './input.variants';
import type { InputSize, InputState } from './input.types';

// ─── Props ─────────────────────────────────────────────────────────────────────

type InputWrapperProps = {
  /** The <input> (or decorated input) to render as the main slot */
  children: ReactNode;

  /** Unique id linking <label htmlFor> to <input id> */
  id: string;

  /** Visible label text */
  label?: string;

  /** Shows a red asterisk — communicates required status */
  required?: boolean;

  /**
   * Shows a muted "(optional)" badge.
   * Only rendered when `required` is false/undefined.
   */
  optional?: boolean;

  /** Muted secondary text below the input */
  helperText?: string;

  /**
   * Error message below the input.
   * Takes priority over helperText when inputState === 'error'.
   */
  errorMessage?: string;

  /** Controls colours of border/ring/helper text */
  inputState?: InputState;

  /** Controls label font size */
  size?: InputSize;

  /** Makes the wrapper take the full available width */
  fullWidth?: boolean;

  /** Extra classes on the outermost wrapper div */
  wrapperClassName?: string;

  /** Extra classes on the <label> element */
  labelClassName?: string;

  /** Extra classes on the helper/error <p> element */
  helperClassName?: string;
};

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * InputWrapper is an **internal** layout primitive.
 * It is NOT exported from index.ts — it is only used by TextInput,
 * PasswordInput, and SearchInput to avoid repetition.
 *
 * Renders:
 *   <div wrapper>
 *     <label>   ← optional
 *     {children} ← the decorated <input> slot
 *     <p>        ← helper / error text, optional
 *   </div>
 */
export function InputWrapper({
  children,
  id,
  label,
  required,
  optional,
  helperText,
  errorMessage,
  inputState = 'default',
  size = 'md',
  fullWidth = false,
  wrapperClassName,
  labelClassName,
  helperClassName,
}: InputWrapperProps) {
  // Error message takes priority over helper text
  const footerText =
    inputState === 'error' && errorMessage ? errorMessage : helperText;

  return (
    <div className={cn(inputWrapperVariants({ fullWidth }), wrapperClassName)}>
      {/* ── Label row ────────────────────────────────────────────────────── */}
      {label && (
        <label
          htmlFor={id}
          className={cn(inputLabelVariants({ size }), labelClassName)}
        >
          {label}
          {required && (
            <span className="ml-0.5 text-ds-danger" aria-hidden="true">
              {' '}*
            </span>
          )}
          {!required && optional && (
            <span className="ml-1.5 text-xs font-normal text-ds-muted">
              (optional)
            </span>
          )}
        </label>
      )}

      {/* ── Input slot ───────────────────────────────────────────────────── */}
      {children}

      {/* ── Footer: helper / error text ──────────────────────────────────── */}
      {footerText && (
        <p
          className={cn(
            inputHelperVariants({ inputState }),
            'flex items-center gap-1',
            helperClassName,
          )}
          role={inputState === 'error' ? 'alert' : undefined}
          aria-live={inputState === 'error' ? 'polite' : undefined}
        >
          {inputState === 'success' && (
            <CheckCircle2 size={12} className="shrink-0" aria-hidden="true" />
          )}
          {inputState === 'error' && (
            <AlertCircle size={12} className="shrink-0" aria-hidden="true" />
          )}
          {footerText}
        </p>
      )}
    </div>
  );
}
