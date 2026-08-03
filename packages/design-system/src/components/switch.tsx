import { forwardRef, type InputHTMLAttributes, useId } from "react";

import { cn } from "@nova/utils";

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: string;
  description?: string;
  size?: "sm" | "md" | "lg";
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, description, size = "md", className, id: idProp, disabled, ...props }, ref) => {
    const autoId = useId();
    const id = idProp ?? autoId;
    const descId = `${id}-desc`;

    const trackSize = { sm: "h-4 w-7", md: "h-5 w-9", lg: "h-6 w-11" };
    const thumbSize = { sm: "h-3 w-3", md: "h-3.5 w-3.5", lg: "h-4.5 w-4.5" };
    const thumbTranslate = {
      sm: "peer-checked:translate-x-3",
      md: "peer-checked:translate-x-4",
      lg: "peer-checked:translate-x-5",
    };

    return (
      <label
        htmlFor={id}
        className={cn(
          "flex cursor-pointer items-start gap-3",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        <div className="relative mt-0.5 shrink-0">
          <input
            ref={ref}
            id={id}
            type="checkbox"
            role="switch"
            disabled={disabled}
            aria-describedby={description ? descId : undefined}
            className={cn("peer sr-only", className)}
            {...props}
          />
          <div
            className={cn(
              "rounded-full border-2 border-transparent transition-colors duration-200",
              "bg-[color:var(--color-disabled)] peer-checked:bg-[color:var(--color-primary)]",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-[color:var(--color-border-focus)] peer-focus-visible:ring-offset-2",
              trackSize[size],
            )}
          />
          <div
            className={cn(
              "absolute left-0.5 top-0.5 rounded-full bg-white shadow-sm transition-transform duration-200",
              thumbSize[size],
              thumbTranslate[size],
            )}
          />
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
Switch.displayName = "Switch";
