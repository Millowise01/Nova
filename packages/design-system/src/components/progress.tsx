import type { HTMLAttributes } from "react";

import { cn } from "@nova/utils";

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  size?: "xs" | "sm" | "md" | "lg";
  tone?: "primary" | "accent" | "success" | "warning" | "error";
  label?: string;
  showValue?: boolean;
  indeterminate?: boolean;
}

const sizeClasses = { xs: "h-1", sm: "h-1.5", md: "h-2.5", lg: "h-4" };
const toneClasses = {
  primary: "bg-[color:var(--color-primary)]",
  accent: "bg-[color:var(--color-accent)]",
  success: "bg-[color:var(--color-success)]",
  warning: "bg-[color:var(--color-warning)]",
  error: "bg-[color:var(--color-error)]",
};

export function Progress({
  value = 0,
  max = 100,
  size = "md",
  tone = "primary",
  label,
  showValue = false,
  indeterminate = false,
  className,
  ...props
}: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn("w-full", className)} {...props}>
      {(label || showValue) && (
        <div className="mb-1.5 flex items-center justify-between gap-2">
          {label && (
            <span className="text-sm font-medium text-[color:var(--color-foreground)]">
              {label}
            </span>
          )}
          {showValue && !indeterminate && (
            <span className="text-xs text-[color:var(--color-foreground-muted)]">
              {Math.round(pct)}%
            </span>
          )}
        </div>
      )}

      <div
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
        aria-valuetext={indeterminate ? "Loading" : `${Math.round(pct)}%`}
        className={cn(
          "w-full overflow-hidden rounded-full bg-[color:var(--color-muted)]",
          sizeClasses[size],
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            toneClasses[tone],
            indeterminate && "w-1/3 animate-[nova-shimmer_1.5s_ease-in-out_infinite]",
          )}
          style={indeterminate ? undefined : { width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
