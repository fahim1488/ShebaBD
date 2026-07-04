import { forwardRef, useId, useRef, useCallback } from 'react';
import { Loader2, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import {
  inputElementVariants,
  inputFieldContainerVariants,
  inputIconSizes,
  prefixIconWrapper,
  suffixIconWrapper,
} from './input.variants';
import { InputWrapper } from './InputWrapper';
import type { BaseInputProps } from './input.types';

// ─── Props ─────────────────────────────────────────────────────────────────────

export type TextInputProps = BaseInputProps & {
  /**
   * HTML input type.
   * TextInput handles: 'text' | 'email' | 'number'
   * PasswordInput overrides this to 'password' / 'text' internally.
   * SearchInput overrides this to 'search' internally.
   * @default 'text'
   */
  type?: 'text' | 'email' | 'number' | 'password' | 'search';
};

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * TextInput — the core building block of the Input component library.
 *
 * Used directly for: type="text", type="email", type="number"
 * Used internally by: PasswordInput, SearchInput
 *
 * Features:
 * - forwardRef compatible
 * - Label, helper text, error message via InputWrapper
 * - Prefix & suffix Lucide icons
 * - Loading spinner (replaces suffix icon)
 * - Clearable ✕ button (shown when value is non-empty)
 * - Validation states: default / success / error
 * - Sizes: sm / md / lg
 * - fullWidth
 * - disabled, readOnly
 * - aria-invalid, aria-label passthrough
 * - Keyboard accessible (standard tab focus, visible focus ring)
 */
export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      // Wrapper props
      label,
      helperText,
      errorMessage,
      required,
      optional,
      wrapperClassName,
      labelClassName,
      helperClassName,

      // Visual
      inputState = 'default',
      size = 'md',
      fullWidth = false,
      prefixIcon: PrefixIcon,
      suffixIcon: SuffixIcon,
      loading = false,
      clearable = false,

      // Input element
      type = 'text',
      id: idProp,
      className,        // alias → inputClassName
      inputClassName,
      placeholder,
      disabled,
      readOnly,

      // Value & events (controlled)
      value,
      onChange,

      // Accessibility
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedby,

      ...rest
    },
    ref,
  ) => {
    // Generate a stable id if none is provided (links <label> ↔ <input>)
    const autoId = useId();
    const inputId = idProp ?? `input-${autoId}`;

    // Determine the suffix slot: loading spinner > clearable X > suffixIcon
    const isClearable =
      clearable && !loading && !disabled && !readOnly && !!value;
    const hasSuffixSlot = loading || isClearable || !!SuffixIcon;
    const hasPrefixIcon = !!PrefixIcon;

    const iconSize = inputIconSizes[size];

    // ── Clear handler ──────────────────────────────────────────────────────
    // Fires a synthetic change event so React-controlled inputs update correctly.
    const inputRef = useRef<HTMLInputElement | null>(null);

    const handleClear = useCallback(() => {
      // Merge external ref with internal ref
      const inputEl =
        typeof ref === 'object' && ref?.current
          ? ref.current
          : inputRef.current;

      if (!inputEl) return;

      // Native setter to update value in a controlled React environment
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value',
      )?.set;
      nativeInputValueSetter?.call(inputEl, '');

      // Dispatch synthetic input + change events so React state updates
      inputEl.dispatchEvent(new Event('input', { bubbles: true }));
      inputEl.dispatchEvent(new Event('change', { bubbles: true }));
      inputEl.focus();
    }, [ref]);

    // ── Computed helper id for aria-describedby ────────────────────────────
    const helperId =
      helperText || errorMessage ? `${inputId}-helper` : undefined;
    const finalAriaDescribedby =
      [ariaDescribedby, helperId].filter(Boolean).join(' ') || undefined;

    return (
      <InputWrapper
        id={inputId}
        label={label}
        required={required}
        optional={optional}
        helperText={helperText}
        errorMessage={errorMessage}
        inputState={inputState}
        size={size}
        fullWidth={fullWidth}
        wrapperClassName={wrapperClassName}
        labelClassName={labelClassName}
        helperClassName={helperClassName}
      >
        {/* ── Field container: icons + input ─────────────────────────────── */}
        <div
          className={cn(
            inputFieldContainerVariants({ fullWidth }),
          )}
        >
          {/* Prefix icon */}
          {PrefixIcon && (
            <span className={prefixIconWrapper} aria-hidden="true">
              <PrefixIcon size={iconSize} />
            </span>
          )}

          {/* The input itself */}
          <input
            ref={(node) => {
              // Merge forwarded ref with internal ref
              (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
              if (typeof ref === 'function') ref(node);
              else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
            }}
            id={inputId}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            aria-label={ariaLabel}
            aria-invalid={inputState === 'error' ? true : undefined}
            aria-describedby={finalAriaDescribedby}
            aria-required={required}
            data-loading={loading || undefined}
            className={cn(
              inputElementVariants({
                size,
                inputState,
                hasPrefixIcon,
                hasSuffixSlot,
              }),
              inputClassName,
              className,
            )}
            {...rest}
          />

          {/* Suffix slot — only one of: spinner | clear | suffixIcon */}
          {hasSuffixSlot && (
            <span className={suffixIconWrapper}>
              {/* Loading spinner */}
              {loading && (
                <Loader2
                  size={iconSize}
                  className="animate-spin text-ds-muted"
                  aria-hidden="true"
                />
              )}

              {/* Clearable × button */}
              {isClearable && (
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label="Clear input"
                  onClick={handleClear}
                  className={cn(
                    'flex items-center justify-center rounded-full text-ds-muted',
                    'pointer-events-auto transition-colors duration-ds-fast',
                    'hover:text-ds-foreground focus-visible:outline focus-visible:outline-2',
                    'focus-visible:outline-ds-primary focus-visible:outline-offset-1',
                  )}
                >
                  <X size={iconSize} aria-hidden="true" />
                </button>
              )}

              {/* Static suffix icon (only shown when not loading and not clearable) */}
              {!loading && !isClearable && SuffixIcon && (
                <SuffixIcon
                  size={iconSize}
                  className="pointer-events-none text-ds-muted"
                  aria-hidden="true"
                />
              )}
            </span>
          )}
        </div>
      </InputWrapper>
    );
  },
);

TextInput.displayName = 'TextInput';

// ─── Convenience aliases ───────────────────────────────────────────────────────
// EmailInput and NumberInput are thin wrappers over TextInput with a preset type.
// They accept the full TextInputProps minus `type` (which is fixed).

export type EmailInputProps = Omit<TextInputProps, 'type'>;

/**
 * EmailInput — a TextInput with type="email" preset.
 * Inherits all features: label, icons, states, sizes, clearable, loading.
 */
export const EmailInput = forwardRef<HTMLInputElement, EmailInputProps>(
  (props, ref) => <TextInput ref={ref} type="email" {...props} />,
);
EmailInput.displayName = 'EmailInput';

export type NumberInputProps = Omit<TextInputProps, 'type'>;

/**
 * NumberInput — a TextInput with type="number" preset.
 * Inherits all features: label, icons, states, sizes, clearable, loading.
 */
export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  (props, ref) => <TextInput ref={ref} type="number" {...props} />,
);
NumberInput.displayName = 'NumberInput';
