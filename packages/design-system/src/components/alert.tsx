import { cva, type VariantProps } from "class-variance-authority";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@nova/utils";

const alertVariants = cva("relative flex gap-3 rounded-lg border p-4 text-sm", {
  variants: {
    tone: {
      info: "border-[color:var(--color-info-border)] bg-[color:var(--color-info-subtle)] text-[color:var(--color-foreground)]",
      success:
        "border-[color:var(--color-success-border)] bg-[color:var(--color-success-subtle)] text-[color:var(--color-foreground)]",
      warning:
        "border-[color:var(--color-warning-border)] bg-[color:var(--color-warning-subtle)] text-[color:var(--color-foreground)]",
      error:
        "border-[color:var(--color-error-border)] bg-[color:var(--color-error-subtle)] text-[color:var(--color-foreground)]",
      neutral:
        "border-[color:var(--color-border)] bg-[color:var(--color-muted)] text-[color:var(--color-foreground)]",
    },
  },
  defaultVariants: { tone: "info" },
});

const iconMap = {
  info: <Info size={18} className="text-[color:var(--color-info)]" aria-hidden="true" />,
  success: (
    <CheckCircle2 size={18} className="text-[color:var(--color-success)]" aria-hidden="true" />
  ),
  warning: (
    <AlertTriangle size={18} className="text-[color:var(--color-warning)]" aria-hidden="true" />
  ),
  error: <AlertCircle size={18} className="text-[color:var(--color-error)]" aria-hidden="true" />,
  neutral: (
    <Info size={18} className="text-[color:var(--color-foreground-muted)]" aria-hidden="true" />
  ),
};

export interface AlertProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {
  title?: string;
  icon?: ReactNode | false;
  onDismiss?: () => void;
}

export function Alert({
  tone = "info",
  title,
  icon,
  onDismiss,
  className,
  children,
  ...props
}: AlertProps) {
  const defaultIcon = icon === false ? null : (icon ?? iconMap[tone ?? "info"]);

  return (
    <div role="alert" className={cn(alertVariants({ tone }), className)} {...props}>
      {defaultIcon && <span className="mt-0.5 shrink-0">{defaultIcon}</span>}

      <div className="min-w-0 flex-1">
        {title && <p className="mb-1 font-semibold">{title}</p>}
        {children && <div className="text-[color:var(--color-foreground-muted)]">{children}</div>}
      </div>

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="shrink-0 rounded p-0.5 text-[color:var(--color-foreground-muted)] hover:text-[color:var(--color-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-border-focus)]"
        >
          <X size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
