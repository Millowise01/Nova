import type { HTMLAttributes } from "react";
import { cn } from "@nova/utils";

export interface PriceDisplayProps extends HTMLAttributes<HTMLDivElement> {
  price: number;
  originalPrice?: number;
  currency?: string;
  locale?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showDiscount?: boolean;
}

const sizeClasses = {
  sm: { price: "text-sm font-semibold", original: "text-xs", discount: "text-xs" },
  md: { price: "text-base font-semibold", original: "text-sm", discount: "text-xs" },
  lg: { price: "text-xl font-bold", original: "text-sm", discount: "text-xs" },
  xl: { price: "text-2xl font-bold", original: "text-base", discount: "text-sm" },
};

export function PriceDisplay({
  price,
  originalPrice,
  currency = "USD",
  locale = "en-US",
  size = "md",
  showDiscount = true,
  className,
  ...props
}: PriceDisplayProps) {
  const fmt = (n: number) =>
    new Intl.NumberFormat(locale, { style: "currency", currency }).format(n);

  const discount =
    originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : null;

  const classes = sizeClasses[size];

  return (
    <div className={cn("flex flex-wrap items-baseline gap-2", className)} {...props}>
      <span className={cn(classes.price, "text-[color:var(--color-foreground)]")}>
        {fmt(price)}
      </span>
      {originalPrice && originalPrice > price && (
        <span
          className={cn(
            classes.original,
            "text-[color:var(--color-foreground-muted)] line-through",
          )}
        >
          {fmt(originalPrice)}
        </span>
      )}
      {showDiscount && discount && (
        <span className={cn(classes.discount, "font-semibold text-[color:var(--color-success)]")}>
          -{discount}%
        </span>
      )}
    </div>
  );
}
