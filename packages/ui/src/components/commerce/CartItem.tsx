import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@nova/utils";
import { X } from "lucide-react";
import { PriceDisplay } from "./PriceDisplay";
import { QuantityInput } from "./QuantityInput";

export interface CartItemProps extends HTMLAttributes<HTMLDivElement> {
  image?: string;
  title: string;
  variant?: string;
  price: number;
  originalPrice?: number;
  currency?: string;
  quantity: number;
  maxQuantity?: number;
  onQuantityChange?: (qty: number) => void;
  onRemove?: () => void;
  loading?: boolean;
  actions?: ReactNode;
}

export function CartItem({
  image,
  title,
  variant,
  price,
  originalPrice,
  currency = "USD",
  quantity,
  maxQuantity,
  onQuantityChange,
  onRemove,
  loading = false,
  actions,
  className,
  ...props
}: CartItemProps) {
  if (loading) {
    return (
      <div className={cn("flex gap-4 py-4", className)} {...props}>
        <div className="h-20 w-20 shrink-0 animate-pulse rounded-lg bg-[color:var(--color-muted)]" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 animate-pulse rounded bg-[color:var(--color-muted)]" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-[color:var(--color-muted)]" />
          <div className="h-5 w-1/3 animate-pulse rounded bg-[color:var(--color-muted)]" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex gap-4 py-4", className)} {...props}>
      {/* Image */}
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-muted)]">
        {image ? (
          <img src={image} alt={title} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[color:var(--color-foreground-subtle)]">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[color:var(--color-foreground)]">
              {title}
            </p>
            {variant && (
              <p className="text-xs text-[color:var(--color-foreground-muted)]">{variant}</p>
            )}
          </div>
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              aria-label={`Remove ${title}`}
              className="shrink-0 rounded p-0.5 text-[color:var(--color-foreground-muted)] transition-colors hover:text-[color:var(--color-error)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-border-focus)]"
            >
              <X size={16} aria-hidden="true" />
            </button>
          )}
        </div>

        <PriceDisplay price={price} originalPrice={originalPrice} currency={currency} size="sm" />

        <div className="mt-auto flex items-center justify-between gap-2">
          {onQuantityChange ? (
            <QuantityInput
              value={quantity}
              max={maxQuantity}
              size="sm"
              onChange={onQuantityChange}
            />
          ) : (
            <span className="text-xs text-[color:var(--color-foreground-muted)]">
              Qty: {quantity}
            </span>
          )}
          {actions}
        </div>
      </div>
    </div>
  );
}
