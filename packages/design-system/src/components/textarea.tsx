import { forwardRef, type TextareaHTMLAttributes, useId } from "react";

import { cn } from "@nova/utils";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  hideLabel?: boolean;
  showCount?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      helperText,
      error,
      hideLabel = false,
      showCount = false,
      className,
      id: idProp,
      disabled,
      maxLength,
      value,
      ...props
    },
    ref,
  ) => {
    const autoId = useId();
    const id = idProp ?? autoId;
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;
    const hasError = Boolean(error);
    const charCount = typeof value === "string" ? value.length : 0;

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

        <textarea
          ref={ref}
          id={id}
          disabled={disabled}
          maxLength={maxLength}
          value={value}
          aria-invalid={hasError || undefined}
          aria-describedby={
            [hasError && errorId, helperText && helperId].filter(Boolean).join(" ") || undefined
          }
          className={cn(
            "min-h-24 w-full resize-y rounded-md border bg-[color:var(--color-background)] px-3 py-2 text-sm text-[color:var(--color-foreground)] outline-none transition-colors duration-100",
            "placeholder:text-[color:var(--color-foreground-subtle)]",
            "focus-visible:ring-2 focus-visible:ring-[color:var(--color-border-focus)] focus-visible:ring-offset-1",
            "disabled:cursor-not-allowed disabled:bg-[color:var(--color-muted)] disabled:opacity-50",
            hasError
              ? "border-[color:var(--color-error)] focus-visible:ring-[color:var(--color-error)]"
              : "border-[color:var(--color-border-input)] hover:border-[color:var(--color-border-strong)]",
            className,
          )}
          {...props}
        />

        <div className="flex items-start justify-between gap-2">
          <div>
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
          {showCount && maxLength && (
            <p
              className="shrink-0 text-xs text-[color:var(--color-foreground-subtle)]"
              aria-live="polite"
            >
              {charCount}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  },
);
Textarea.displayName = "Textarea";
