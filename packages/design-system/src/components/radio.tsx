import { forwardRef, type InputHTMLAttributes, useId } from "react";
import type React from "react";

import { cn } from "@nova/utils";

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  description?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, description, className, id: idProp, disabled, ...props }, ref) => {
    const autoId = useId();
    const id = idProp ?? autoId;
    const descId = `${id}-desc`;

    return (
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
            type="radio"
            disabled={disabled}
            aria-describedby={description ? descId : undefined}
            className={cn(
              "peer h-4 w-4 cursor-pointer appearance-none rounded-full border border-[color:var(--color-border-input)] transition-colors duration-100",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-border-focus)] focus-visible:ring-offset-2",
              "checked:border-[color:var(--color-primary)] hover:border-[color:var(--color-primary)]",
              "disabled:cursor-not-allowed",
              className,
            )}
            {...props}
          />
          <span className="pointer-events-none absolute hidden h-2 w-2 rounded-full bg-[color:var(--color-primary)] peer-checked:block" />
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
    );
  },
);
Radio.displayName = "Radio";

export interface RadioGroupProps {
  label?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export function RadioGroup({ label, error, children, className }: RadioGroupProps) {
  const errorId = useId();
  return (
    <fieldset
      className={cn("flex flex-col gap-3", className)}
      aria-describedby={error ? errorId : undefined}
    >
      {label && (
        <legend className="text-sm font-medium text-[color:var(--color-foreground)]">
          {label}
        </legend>
      )}
      {children}
      {error && (
        <p id={errorId} role="alert" className="text-xs text-[color:var(--color-error)]">
          {error}
        </p>
      )}
    </fieldset>
  );
}
