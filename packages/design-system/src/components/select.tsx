import { ChevronDown } from "lucide-react";
import { forwardRef, type SelectHTMLAttributes, useId } from "react";

import { cn } from "@nova/utils";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  options?: SelectOption[];
  placeholder?: string;
  hideLabel?: boolean;
  inputSize?: "sm" | "md" | "lg";
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      helperText,
      error,
      options,
      placeholder,
      hideLabel = false,
      inputSize = "md",
      className,
      id: idProp,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const autoId = useId();
    const id = idProp ?? autoId;
    const errorId = `${id}-error`;
    const hasError = Boolean(error);

    const sizeClasses = {
      sm: "h-8 pl-3 pr-8 text-xs",
      md: "h-10 pl-3 pr-8 text-sm",
      lg: "h-11 pl-4 pr-9 text-base",
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

        <div className="relative">
          <select
            ref={ref}
            id={id}
            disabled={disabled}
            aria-invalid={hasError || undefined}
            aria-describedby={hasError ? errorId : undefined}
            className={cn(
              "w-full appearance-none rounded-md border bg-[color:var(--color-background)] text-[color:var(--color-foreground)] outline-none transition-colors duration-100",
              "focus-visible:ring-2 focus-visible:ring-[color:var(--color-border-focus)] focus-visible:ring-offset-1",
              "disabled:cursor-not-allowed disabled:bg-[color:var(--color-muted)] disabled:opacity-50",
              hasError
                ? "border-[color:var(--color-error)]"
                : "border-[color:var(--color-border-input)] hover:border-[color:var(--color-border-strong)]",
              sizeClasses[inputSize],
              className,
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options
              ? options.map((o) => (
                  <option key={o.value} value={o.value} disabled={o.disabled}>
                    {o.label}
                  </option>
                ))
              : children}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[color:var(--color-foreground-subtle)]"
            size={16}
            aria-hidden="true"
          />
        </div>

        {error && (
          <p id={errorId} role="alert" className="text-xs text-[color:var(--color-error)]">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="text-xs text-[color:var(--color-foreground-muted)]">{helperText}</p>
        )}
      </div>
    );
  },
);
Select.displayName = "Select";
