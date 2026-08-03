import type { HTMLAttributes } from "react";

import { cn } from "@nova/utils";

export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
  label?: string;
}

export function Divider({ orientation = "horizontal", label, className, ...props }: DividerProps) {
  if (orientation === "vertical") {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={cn("w-px self-stretch bg-[color:var(--color-border)]", className)}
        {...props}
      />
    );
  }

  if (label) {
    return (
      <div role="separator" className={cn("flex items-center gap-3", className)} {...props}>
        <div className="h-px flex-1 bg-[color:var(--color-border)]" />
        <span className="text-xs font-medium text-[color:var(--color-foreground-muted)]">
          {label}
        </span>
        <div className="h-px flex-1 bg-[color:var(--color-border)]" />
      </div>
    );
  }

  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className={cn("h-px w-full bg-[color:var(--color-border)]", className)}
      {...props}
    />
  );
}
