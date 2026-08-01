import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@nova/utils";
import { Skeleton } from "@nova/design-system";
import { TrendingUp, TrendingDown } from "lucide-react";

export interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  trend?: number;
  trendLabel?: string;
  loading?: boolean;
  tone?: "default" | "primary" | "success" | "warning" | "error";
}

const toneClasses = {
  default: "bg-[color:var(--color-surface)] border-[color:var(--color-border)]",
  primary: "bg-[color:var(--color-primary-subtle)] border-[color:var(--color-primary-border)]",
  success: "bg-[color:var(--color-success-subtle)] border-[color:var(--color-success-border)]",
  warning: "bg-[color:var(--color-warning-subtle)] border-[color:var(--color-warning-border)]",
  error: "bg-[color:var(--color-error-subtle)] border-[color:var(--color-error-border)]",
};

const iconToneClasses = {
  default: "bg-[color:var(--color-muted)] text-[color:var(--color-foreground-muted)]",
  primary: "bg-[color:var(--color-primary-subtle)] text-[color:var(--color-primary)]",
  success: "bg-[color:var(--color-success-subtle)] text-[color:var(--color-success)]",
  warning: "bg-[color:var(--color-warning-subtle)] text-[color:var(--color-warning)]",
  error: "bg-[color:var(--color-error-subtle)] text-[color:var(--color-error)]",
};

export function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  trendLabel,
  loading = false,
  tone = "default",
  className,
  ...props
}: StatCardProps) {
  if (loading) {
    return (
      <div className={cn("rounded-xl border p-5", toneClasses[tone], className)} {...props}>
        <Skeleton className="mb-3 h-4 w-1/2" />
        <Skeleton className="mb-2 h-8 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    );
  }

  const isPositive = trend !== undefined && trend > 0;
  const isNegative = trend !== undefined && trend < 0;

  return (
    <div className={cn("rounded-xl border p-5", toneClasses[tone], className)} {...props}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-[color:var(--color-foreground-muted)]">{title}</p>
        {icon && (
          <span
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
              iconToneClasses[tone],
            )}
          >
            {icon}
          </span>
        )}
      </div>

      <p className="mt-2 text-2xl font-bold text-[color:var(--color-foreground)]">{value}</p>

      {(trend !== undefined || description) && (
        <div className="mt-2 flex items-center gap-2">
          {trend !== undefined && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 text-xs font-semibold",
                isPositive && "text-[color:var(--color-success)]",
                isNegative && "text-[color:var(--color-error)]",
                !isPositive && !isNegative && "text-[color:var(--color-foreground-muted)]",
              )}
            >
              {isPositive && <TrendingUp size={12} aria-hidden="true" />}
              {isNegative && <TrendingDown size={12} aria-hidden="true" />}
              {isPositive ? "+" : ""}
              {trend}%
            </span>
          )}
          {(trendLabel || description) && (
            <span className="text-xs text-[color:var(--color-foreground-muted)]">
              {trendLabel ?? description}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
