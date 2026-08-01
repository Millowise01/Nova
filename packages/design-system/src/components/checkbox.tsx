import { forwardRef, type InputHTMLAttributes, useId } from "react";
import { cn } from "@nova/utils";
import { Check, Minus } from "lucide-react";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  description?: string;
  error?: string;
  indeterminate?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    { label, description, error, indeterminate, className, id: idProp, disabled, ...props },
    ref,
  ) => {
    const autoId = useId();
    const id = idProp ?? autoId;
    const descId = `${id}-desc`;
    const errorId = `${id}-error`;

    return (
      <div className="flex flex-col gap-1">
        <label
          htmlFor={id}
          className={cn(
            "flex cursor-pointer items-start gap-3",
            disabled && "cursor-not-allowed opacity-50",
          )}
        >
          <div className="relative mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
            <input
              ref={ref}
              id={id}
              type="checkbox"
              disabled={disabled}
              aria-describedby={
                [description && descId, error && errorId].filter(Boolean).join(" ") || undefined
              }
              aria-invalid={Boolean(error) || undefined}
              className={cn(
                "peer h-4 w-4 cursor-pointer appearance-none rounded border transition-colors duration-100",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-border-focus)] focus-visible:ring-offset-2",
                "checked:border-[color:var(--color-primary)] checked:bg-[color:var(--color-primary)]",
                "disabled:cursor-not-allowed",
                error
                  ? "border-[color:var(--color-error)]"
                  : "border-[color:var(--color-border-input)] hover:border-[color:var(--color-primary)]",
                className,
              )}
              {...props}
            />
            <span className="pointer-events-none absolute hidden text-[color:var(--color-primary-foreground)] peer-checked:flex">
              {indeterminate ? (
                <Minus size={10} strokeWidth={3} />
              ) : (
                <Check size={10} strokeWidth={3} />
              )}
            </span>
          </div>

          {(label || description) && (
            <div className="flex flex-col gap-0.5">
              {label && (
                <span className="text-sm font-medium text-[color:var(--color-foreground)]">
                  {label}
                </span>
              )}
              {description && (
                <span id={descId} className="text-xs text-[color:var(--color-foreground-muted)]">
                  {description}
                </span>
              )}
            </div>
          )}
        </label>

        {error && (
          <p id={errorId} role="alert" className="ml-7 text-xs text-[color:var(--color-error)]">
            {error}
          </p>
        )}
      </div>
    );
  },
);
Checkbox.displayName = "Checkbox";
