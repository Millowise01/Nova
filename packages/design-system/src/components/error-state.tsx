import { AlertCircle } from "lucide-react";
import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@nova/utils";

export interface ErrorStateProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export function ErrorState({
  title = "Something went wrong",
  description,
  action,
  icon,
  children,
  className,
  ...props
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-[color:var(--color-error-border)] bg-[color:var(--color-error-subtle)] p-8 text-center",
        className,
      )}
      {...props}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--color-error-subtle)] text-[color:var(--color-error)]">
        {icon ?? <AlertCircle size={24} aria-hidden="true" />}
      </div>
      <h3 className="text-sm font-semibold text-[color:var(--color-foreground)]">{title}</h3>
      {description && (
        <p className="mt-1 max-w-xs text-sm text-[color:var(--color-foreground-muted)]">
          {description}
        </p>
      )}
      {children && (
        <div className="mt-1 text-sm text-[color:var(--color-foreground-muted)]">{children}</div>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
