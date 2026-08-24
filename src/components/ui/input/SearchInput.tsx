import {
  forwardRef,
  useId,
  useRef,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { Search, X, Loader2 } from 'lucide-react';
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

export type SearchInputProps = Omit<
  BaseInputProps,
  // These are fixed by SearchInput:
  'type' | 'prefixIcon' | 'suffixIcon'
> & {
  /**
   * Called when the user clears the search (clicks ✕ or presses Escape).
   * Fired in addition to any `onChange` with an empty value.
   */
  onClear?: () => void;

  /**
   * Override the clearable behaviour.
   * Defaults to `true` for SearchInput.
   */
  clearable?: boolean;
};

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * SearchInput — a search-optimised input.
 *
 * Built directly on visual primitives (same pattern as PasswordInput).
 *
 * Fixed behaviour vs TextInput:
 * - type is always "search"
 * - prefixIcon is always <Search> (cannot be overridden)
 * - clearable defaults to true
 *
 * Supports both controlled and uncontrolled usage:
 * - Controlled: pass `value` + `onChange`
 * - Uncontrolled: omit both; internal state manages the value,
 *   with optional `onClear` callback when cleared.
 *
 * Pressing Escape clears the search and fires `onClear`.
 */
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
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
      loading = false,
      clearable = true,

      // Input element
      id: idProp,
      inputClassName,
      className,
      placeholder = 'Search…',
      disabled,
      readOnly,

      // Value & events (controlled or uncontrolled)
      value: valueProp,
      onChange: onChangeProp,
      onClear,

      // Keyboard
      onKeyDown,

      // Accessibility
      'aria-label': ariaLabel = 'Search',
      'aria-describedby': ariaDescribedby,

      ...rest
    },
    ref,
  ) => {
    const autoId = useId();
    const inputId = idProp ?? `search-${autoId}`;

    // ── Controlled vs uncontrolled value ────────────────────────────────────
    const isControlled = valueProp !== undefined;
    const [internalValue, setInternalValue] = useState('');
    const currentValue = isControlled ? valueProp : internalValue;

    // Keep internal value in sync when controlled value is cleared externally
    useEffect(() => {
      if (!isControlled) return;
      // nothing to sync for uncontrolled
    }, [isControlled]);

    const inputRef = useRef<HTMLInputElement | null>(null);
    const iconSize = inputIconSizes[size];

    const hasSuffixSlot = loading || (clearable && !!currentValue);

    const helperId =
      helperText || errorMessage ? `${inputId}-helper` : undefined;
    const finalAriaDescribedby =
      [ariaDescribedby, helperId].filter(Boolean).join(' ') || undefined;

    // ── Handlers ─────────────────────────────────────────────────────────────

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isControlled) setInternalValue(e.target.value);
        onChangeProp?.(e);
      },
      [isControlled, onChangeProp],
    );

    const handleClear = useCallback(() => {
      const inputEl =
        typeof ref === 'object' && ref?.current
          ? ref.current
          : inputRef.current;

      if (inputEl) {
        // Synthetic event for controlled React inputs
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          'value',
        )?.set;
        nativeInputValueSetter?.call(inputEl, '');
        inputEl.dispatchEvent(new Event('input', { bubbles: true }));
        inputEl.dispatchEvent(new Event('change', { bubbles: true }));
        inputEl.focus();
      }

      if (!isControlled) setInternalValue('');
      onClear?.();
    }, [ref, isControlled, onClear]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape' && currentValue) {
          e.preventDefault();
          handleClear();
        }
        onKeyDown?.(e);
      },
      [currentValue, handleClear, onKeyDown],
    );

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
          {/* Fixed Search prefix icon */}
          <span className={prefixIconWrapper} aria-hidden="true">
            <Search size={iconSize} />
          </span>

          {/* Search input — always has prefix icon, may have suffix slot */}
          <input
            ref={(node) => {
              (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
              if (typeof ref === 'function') ref(node);
              else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
            }}
            id={inputId}
            type="search"
            value={currentValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            aria-label={ariaLabel}
            aria-invalid={inputState === 'error' ? true : undefined}
            aria-describedby={finalAriaDescribedby}
            data-loading={loading || undefined}
            // Suppress native browser ✕ button (we use our own)
            className={cn(
              inputElementVariants({
                size,
                inputState,
                hasPrefixIcon: true,
                hasSuffixSlot,
              }),
              // Hide native search clear decoration across browsers
              '[&::-webkit-search-cancel-button]:appearance-none',
              '[&::-webkit-search-decoration]:appearance-none',
              inputClassName,
              className,
            )}
            {...rest}
          />

          {/* Suffix slot: spinner or animated clear button */}
          {hasSuffixSlot && (
            <span className={suffixIconWrapper}>
              {loading ? (
                <Loader2
                  size={iconSize}
                  className="animate-spin text-ds-muted pointer-events-none"
                  aria-hidden="true"
                />
              ) : (
                clearable &&
                !!currentValue && (
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-label="Clear search"
                    onClick={handleClear}
                    className={cn(
                      'flex items-center justify-center rounded-full text-ds-muted',
                      'pointer-events-auto transition-all duration-ds-fast',
                      'hover:text-ds-foreground hover:scale-110',
                      'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1',
                      'focus-visible:outline-ds-primary',
                      'animate-ds-scale-in',
                    )}
                  >
                    <X size={iconSize} aria-hidden="true" />
                  </button>
                )
              )}
            </span>
          )}
        </div>
      </InputWrapper>
    );
  },
);

SearchInput.displayName = 'SearchInput';
