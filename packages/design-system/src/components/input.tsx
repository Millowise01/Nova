import { forwardRef, type InputHTMLAttributes, type ReactNode, useId } from "react";

import { cn } from "@nova/utils";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  label?: string;
  helperText?: string;
  error?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  inputSize?: "sm" | "md" | "lg";
  hideLabel?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      prefix,
      suffix,
      inputSize = "md",
      hideLabel = false,
      className,
      id: idProp,
      disabled,
      ...props
    },
    ref,
  ) => {
    const autoId = useId();
    const id = idProp ?? autoId;
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;
    const hasError = Boolean(error);

    const sizeClasses = {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-3 text-sm",
      lg: "h-11 px-4 text-base",
    };

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label && (
          <label
            htmlFor={id}
            className={cn(
              "text-sm font-medium text-[color:var(--color-foreground)]",
              hideLabel && "sr-only",
              disabled && "opacity-50",
            )}
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {prefix && (
            <span className="pointer-events-none absolute left-3 flex items-center text-[color:var(--color-foreground-subtle)]">
              {prefix}
            </span>
          )}

          <input
            ref={ref}
            id={id}
            disabled={disabled}
            aria-invalid={hasError || undefined}
            aria-describedby={
              [hasError && errorId, helperText && helperId].filter(Boolean).join(" ") || undefined
            }
            className={cn(
              "w-full rounded-md border bg-[color:var(--color-background)] text-[color:var(--color-foreground)] outline-none transition-colors duration-100",
              "placeholder:text-[color:var(--color-foreground-subtle)]",
              "focus-visible:ring-2 focus-visible:ring-[color:var(--color-border-focus)] focus-visible:ring-offset-1",
              "disabled:cursor-not-allowed disabled:bg-[color:var(--color-muted)] disabled:opacity-50",
              hasError
                ? "border-[color:var(--color-error)] focus-visible:ring-[color:var(--color-error)]"
                : "border-[color:var(--color-border-input)] hover:border-[color:var(--color-border-strong)]",
              sizeClasses[inputSize],
              prefix && "pl-9",
              suffix && "pr-9",
              className,
            )}
            {...props}
          />

          {suffix && (
            <span className="pointer-events-none absolute right-3 flex items-center text-[color:var(--color-foreground-subtle)]">
              {suffix}
            </span>
          )}
        </div>

        {error && (
          <p id={errorId} role="alert" className="text-xs text-[color:var(--color-error)]">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="text-xs text-[color:var(--color-foreground-muted)]">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";
