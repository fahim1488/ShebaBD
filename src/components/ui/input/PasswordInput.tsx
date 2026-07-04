import { forwardRef, useId, useRef, useState, useCallback } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
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

export type PasswordInputProps = Omit<
  BaseInputProps,
  // These are fixed or internally managed by PasswordInput:
  'type' | 'suffixIcon'
> & {
  /**
   * aria-label for the show/hide toggle button.
   * Defaults to "Show password" / "Hide password" automatically.
   * Override only if you need a custom label (e.g. a different language).
   */
  toggleAriaLabel?: string;
};

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * PasswordInput — a specialised input for password fields.
 *
 * Built on top of TextInput's visual primitives (not wrapping TextInput
 * component directly, to keep internal type state isolated and avoid
 * double-ref complexity).
 *
 * Features:
 * - forwardRef compatible
 * - Eye / EyeOff toggle to reveal / hide password text
 * - All TextInput features: label, helper text, error, prefix icon,
 *   loading, sizes, validation states, aria attributes
 * - `suffixIcon` is reserved for the eye toggle (cannot be overridden)
 */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
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
      loading = false,

      // Input element
      id: idProp,
      inputClassName,
      className,
      placeholder = 'Enter password',
      disabled,
      readOnly,

      // Value & events
      value,
      onChange,

      // Accessibility
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedby,
      toggleAriaLabel,

      ...rest
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    const autoId = useId();
    const inputId = idProp ?? `password-${autoId}`;

    const inputRef = useRef<HTMLInputElement | null>(null);
    const iconSize = inputIconSizes[size];

    const hasPrefixIcon = !!PrefixIcon;
    // Suffix slot is always present: either loading spinner or eye toggle
    const hasSuffixSlot = true;

    const helperId =
      helperText || errorMessage ? `${inputId}-helper` : undefined;
    const finalAriaDescribedby =
      [ariaDescribedby, helperId].filter(Boolean).join(' ') || undefined;

    const handleToggle = useCallback(() => {
      setShowPassword((prev) => !prev);
      // Return focus to the input after toggling
      const inputEl =
        typeof ref === 'object' && ref?.current
          ? ref.current
          : inputRef.current;
      inputEl?.focus();
    }, [ref]);

    const EyeIcon = showPassword ? EyeOff : Eye;
    const toggleLabel = showPassword
      ? (toggleAriaLabel ?? 'Hide password')
      : (toggleAriaLabel ?? 'Show password');

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
        <div className={cn(inputFieldContainerVariants({ fullWidth }))}>
          {/* Prefix icon */}
          {PrefixIcon && (
            <span className={prefixIconWrapper} aria-hidden="true">
              <PrefixIcon size={iconSize} />
            </span>
          )}

          {/* Password input */}
          <input
            ref={(node) => {
              (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
              if (typeof ref === 'function') ref(node);
              else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
            }}
            id={inputId}
            type={showPassword ? 'text' : 'password'}
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
              // Prevent browser's native password reveal button (Edge/Chrome)
              '[&::-ms-reveal]:hidden [&::-ms-clear]:hidden',
              inputClassName,
              className,
            )}
            {...rest}
          />

          {/* Suffix slot */}
          <span className={suffixIconWrapper}>
            {loading ? (
              <Loader2
                size={iconSize}
                className="animate-spin text-ds-muted pointer-events-none"
                aria-hidden="true"
              />
            ) : (
              <button
                type="button"
                tabIndex={-1}
                aria-label={toggleLabel}
                aria-pressed={showPassword}
                onClick={handleToggle}
                disabled={disabled}
                className={cn(
                  'flex items-center justify-center rounded text-ds-muted',
                  'pointer-events-auto transition-colors duration-ds-fast',
                  'hover:text-ds-foreground',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1',
                  'focus-visible:outline-ds-primary',
                  'disabled:pointer-events-none disabled:opacity-40',
                )}
              >
                <EyeIcon size={iconSize} aria-hidden="true" />
              </button>
            )}
          </span>
        </div>
      </InputWrapper>
    );
  },
);

PasswordInput.displayName = 'PasswordInput';
