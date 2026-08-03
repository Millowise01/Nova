import type { HTMLAttributes } from "react";

import { Badge } from "@nova/design-system";
import { cn } from "@nova/utils";

export interface MetricBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  value: number | string;
  label?: string;
  trend?: "up" | "down" | "neutral";
  format?: "number" | "percent" | "currency";
  currency?: string;
  locale?: string;
  size?: "sm" | "md";
}

const trendConfig = {
  up: { tone: "success" as const, symbol: "↑" },
  down: { tone: "error" as const, symbol: "↓" },
  neutral: { tone: "neutral" as const, symbol: "→" },
};

export function MetricBadge({
  value,
  label,
  trend,
  format = "number",
  currency = "USD",
  locale = "en-US",
  size = "md",
  className,
  ...props
}: MetricBadgeProps) {
  function formatValue(v: number | string): string {
    if (typeof v === "string") return v;
    if (format === "percent") return `${v > 0 ? "+" : ""}${v}%`;
    if (format === "currency")
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        notation: "compact",
      }).format(v);
    return new Intl.NumberFormat(locale, { notation: "compact" }).format(v);
  }

  const cfg = trend ? trendConfig[trend] : undefined;

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)} {...props}>
      {label && <span className="text-xs text-[color:var(--color-foreground-muted)]">{label}</span>}
      <Badge tone={cfg?.tone ?? "neutral"} variant="soft" size={size} dot={!cfg}>
        {cfg && <span aria-hidden="true">{cfg.symbol}</span>}
        {formatValue(value)}
      </Badge>
    </span>
  );
}
