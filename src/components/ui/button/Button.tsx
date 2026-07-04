import React, {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import {
  buttonIconSizes,
  buttonVariants,
  type ButtonSize,
  type ButtonVariant,
} from './button.variants';

export type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  rounded?: boolean;
  loading?: boolean;
  iconOnly?: boolean;
  leftIcon?: React.ComponentType<{ size?: number; className?: string }> | React.ReactNode;
  rightIcon?: React.ComponentType<{ size?: number; className?: string }> | React.ReactNode;
  className?: string;
  children?: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      rounded = false,
      loading = false,
      iconOnly = false,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      className,
      children,
      disabled,
      type = 'button',
      'aria-label': ariaLabel,
      ...props
    },
    ref,
  ) => {
    const isIconOnly = iconOnly || (!children && !!LeftIcon && !RightIcon);
    const isDisabled = disabled || loading;
    const iconSize = buttonIconSizes[size];

    if (import.meta.env.DEV && isIconOnly && !ariaLabel && !children) {
      console.warn(
        'Button: icon-only buttons require an aria-label for accessibility.',
      );
    }

    const renderIcon = (
      Icon: React.ComponentType<{ size?: number; className?: string }> | React.ReactNode,
      sizeVal: number,
    ) => {
      if (!Icon) return null;
      if (React.isValidElement(Icon)) {
        return Icon;
      }
      const IconComponent = Icon as React.ComponentType<{ size?: number; className?: string }>;
      return <IconComponent size={sizeVal} className="shrink-0" aria-hidden="true" />;
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-disabled={isDisabled || undefined}
        aria-busy={loading || undefined}
        aria-label={ariaLabel}
        className={cn(
          buttonVariants({
            variant,
            size,
            fullWidth,
            rounded,
            iconOnly: isIconOnly,
          }),
          className,
        )}
        {...props}
      >
        {loading && (
          <Loader2
            size={iconSize}
            className="shrink-0 animate-spin"
            aria-hidden="true"
          />
        )}

        {!loading && LeftIcon && renderIcon(LeftIcon, iconSize)}

        {!isIconOnly && children && (
          <span className={cn(loading && 'opacity-80')}>{children}</span>
        )}

        {isIconOnly && !loading && children}

        {!loading && RightIcon && !isIconOnly && renderIcon(RightIcon, iconSize)}
      </button>
    );
  },
);

Button.displayName = 'Button';
