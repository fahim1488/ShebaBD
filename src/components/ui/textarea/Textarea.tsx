import {
  forwardRef,
  useId,
  useRef,
  useCallback,
  useEffect,
  type ChangeEvent,
} from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
import {
  textareaWrapperVariants,
  textareaElementVariants,
  textareaLabelVariants,
  textareaHelperVariants,
  getCounterColorClass,
  resizeClassMap,
  sizeLineHeights,
  sizePaddingY,
} from './textarea.variants';
import type { TextareaProps } from './textarea.types';

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * Textarea — a fully-featured, production-ready multiline input.
 *
 * Features:
 * ─ Auto Resize     Grows with content; optional maxRows cap
 * ─ Character Counter  Live count with colour-coded warning / danger thresholds
 * ─ Label           Optional, with required asterisk or "(optional)" badge
 * ─ Helper Text     Muted description below the field
 * ─ Error State     Red border + ring + error message + alert icon
 * ─ Success State   Green border + ring + success message + check icon
 * ─ Disabled        Pointer-events-none, reduced opacity, muted background
 * ─ Read-Only       Cursor-default, slightly muted background
 * ─ Resize Option   none | vertical | horizontal | both
 * ─ Required        aria-required + HTML required + label asterisk
 * ─ forwardRef      Fully ref-forwarding
 * ─ Dark Mode       Automatically adapts via Tailwind dark: variants + DS tokens
 * ─ Responsive      Uses DS spacing tokens; works on mobile, tablet, desktop
 * ─ Accessible      aria-invalid, aria-required, aria-describedby, role="alert"
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      // ── Wrapper props ──────────────────────────────────────────────────────
      label,
      helperText,
      errorMessage,
      required,
      optional,
      wrapperClassName,
      labelClassName,
      textareaClassName,
      helperClassName,

      // ── Visual ────────────────────────────────────────────────────────────
      inputState = 'default',
      size = 'md',
      fullWidth = false,

      // ── Textarea-specific ─────────────────────────────────────────────────
      autoResize = false,
      minRows = 3,
      maxRows,
      resize = 'vertical',
      showCount = false,

      // ── Native textarea props ──────────────────────────────────────────────
      id: idProp,
      className,           // forwarded to textareaClassName for convenience
      placeholder,
      disabled,
      readOnly,
      maxLength,
      value,
      defaultValue,
      onChange,

      // ── Accessibility ──────────────────────────────────────────────────────
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedby,

      ...rest
    },
    ref,
  ) => {
    // ── Stable IDs ───────────────────────────────────────────────────────────
    const autoId = useId();
    const inputId = idProp ?? `textarea-${autoId}`;
    const helperId = `${inputId}-helper`;

    // ── Internal ref (used for autoResize measurement) ────────────────────────
    const innerRef = useRef<HTMLTextAreaElement | null>(null);

    // Merge forwarded ref with internal ref
    const setRef = useCallback(
      (node: HTMLTextAreaElement | null) => {
        (innerRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref)
          (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current =
            node;
      },
      [ref],
    );

    // ── autoResize: adjust height ─────────────────────────────────────────────
    const adjustHeight = useCallback(() => {
      const el = innerRef.current;
      if (!el || !autoResize) return;

      // 1. Reset so scrollHeight is accurate
      el.style.height = 'auto';

      const scrollH = el.scrollHeight;

      if (maxRows) {
        const lineH = sizeLineHeights[size];
        const padY = sizePaddingY[size];
        const maxH = maxRows * lineH + padY;

        el.style.height = `${Math.min(scrollH, maxH)}px`;
        el.style.overflowY = scrollH > maxH ? 'auto' : 'hidden';
      } else {
        el.style.height = `${scrollH}px`;
        el.style.overflowY = 'hidden';
      }
    }, [autoResize, maxRows, size]);

    // Adjust on mount and whenever value changes (controlled usage)
    useEffect(() => {
      adjustHeight();
    }, [value, adjustHeight]);

    // Also adjust on mount for uncontrolled usage (defaultValue)
    useEffect(() => {
      adjustHeight();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── onChange: run adjustHeight for uncontrolled autoResize ───────────────
    const handleChange = useCallback(
      (e: ChangeEvent<HTMLTextAreaElement>) => {
        if (autoResize) adjustHeight();
        onChange?.(e);
      },
      [autoResize, adjustHeight, onChange],
    );

    // ── Computed values ───────────────────────────────────────────────────────

    // Resolve actual current character count
    const currentLength =
      typeof value === 'string'
        ? value.length
        : innerRef.current?.value?.length ?? 0;

    // Show counter when maxLength is set OR showCount is explicitly true
    const showCounter = showCount || maxLength !== undefined;

    // Error message takes priority over helper text
    const footerText =
      inputState === 'error' && errorMessage ? errorMessage : helperText;

    // Compose aria-describedby
    const hasFooter = !!footerText;
    const finalAriaDescribedby =
      [ariaDescribedby, hasFooter ? helperId : undefined]
        .filter(Boolean)
        .join(' ') || undefined;

    // Resolve resize CSS class
    const resizeClass = autoResize ? 'resize-none' : resizeClassMap[resize];

    return (
      <div
        className={cn(textareaWrapperVariants({ fullWidth }), wrapperClassName)}
      >
        {/* ── Label row ──────────────────────────────────────────────────── */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(textareaLabelVariants({ size }), labelClassName)}
          >
            {label}
            {required && (
              <span className="ml-0.5 text-ds-danger" aria-hidden="true">
                {' '}
                *
              </span>
            )}
            {!required && optional && (
              <span className="ml-1.5 text-xs font-normal text-ds-muted">
                (optional)
              </span>
            )}
          </label>
        )}

        {/* ── Textarea wrapper: relative so the counter can sit inside ────── */}
        <div className={cn('relative', fullWidth ? 'w-full' : 'w-fit')}>
          <textarea
            ref={setRef}
            id={inputId}
            rows={minRows}
            value={value}
            defaultValue={defaultValue}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            maxLength={maxLength}
            aria-label={ariaLabel}
            aria-invalid={inputState === 'error' ? true : undefined}
            aria-required={required}
            aria-describedby={finalAriaDescribedby}
            className={cn(
              textareaElementVariants({ size, inputState }),
              resizeClass,
              // When showing counter, add bottom padding so text doesn't overlap
              showCounter && 'pb-7',
              textareaClassName,
              className,
            )}
            {...rest}
          />

          {/* ── Character counter (inside the textarea, bottom-right) ──────── */}
          {showCounter && (
            <span
              aria-live="polite"
              aria-atomic="true"
              className={cn(
                'pointer-events-none absolute bottom-2 right-3',
                'text-xs tabular-nums transition-colors duration-ds-fast',
                maxLength
                  ? getCounterColorClass(currentLength, maxLength)
                  : 'text-ds-muted',
              )}
            >
              {maxLength ? `${currentLength} / ${maxLength}` : currentLength}
            </span>
          )}
        </div>

        {/* ── Footer: helper / error text ─────────────────────────────────── */}
        {footerText && (
          <p
            id={helperId}
            role={inputState === 'error' ? 'alert' : undefined}
            aria-live={inputState === 'error' ? 'polite' : undefined}
            className={cn(
              textareaHelperVariants({ inputState }),
              'mt-1.5 flex items-center gap-1',
              helperClassName,
            )}
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
  },
);

Textarea.displayName = 'Textarea';
