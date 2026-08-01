import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@nova/utils";

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  children,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-[color:var(--color-border)] p-10 text-center",
        className,
      )}
      {...props}
    >
      {icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--color-muted)] text-[color:var(--color-foreground-muted)]">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-semibold text-[color:var(--color-foreground)]">{title}</h3>
      {description && (
        <p className="mt-1 max-w-xs text-sm text-[color:var(--color-foreground-muted)]">
          {description}
        </p>
      )}
      {(action || children) && <div className="mt-4">{action ?? children}</div>}
    </div>
  );
}
