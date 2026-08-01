import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@nova/utils";
import { Badge } from "@nova/design-system";
import { PriceDisplay } from "./PriceDisplay";
import { RatingStars } from "./RatingStars";

export interface ProductCardProps extends HTMLAttributes<HTMLDivElement> {
  image?: string;
  imageAlt?: string;
  title: string;
  brand?: string;
  price: number;
  originalPrice?: number;
  currency?: string;
  rating?: number;
  reviewCount?: number;
  badge?: string;
  badgeTone?: "accent" | "success" | "warning" | "error" | "primary";
  loading?: boolean;
  actions?: ReactNode;
  href?: string;
}

export function ProductCard({
  image,
  imageAlt,
  title,
  brand,
  price,
  originalPrice,
  currency = "USD",
  rating,
  reviewCount,
  badge,
  badgeTone = "accent",
  loading = false,
  actions,
  href,
  className,
  ...props
}: ProductCardProps) {
  if (loading) {
    return (
      <div
        className={cn(
          "overflow-hidden rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)]",
          className,
        )}
        {...props}
      >
        <div className="aspect-square w-full animate-pulse bg-[color:var(--color-muted)]" />
        <div className="space-y-2 p-4">
          <div className="h-3 w-1/3 animate-pulse rounded bg-[color:var(--color-muted)]" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-[color:var(--color-muted)]" />
          <div className="h-5 w-1/2 animate-pulse rounded bg-[color:var(--color-muted)]" />
        </div>
      </div>
    );
  }

  const Wrapper = href ? "a" : "div";

  return (
    <div
      className={cn(
        "group overflow-hidden rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)]",
        "transition-shadow duration-200 hover:shadow-md",
        className,
      )}
      {...props}
    >
      {/* Image */}
      <Wrapper
        {...(href ? { href } : {})}
        className={cn(
          "relative block aspect-square w-full overflow-hidden bg-[color:var(--color-muted)]",
          href &&
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-border-focus)]",
        )}
      >
        {image ? (
          <img
            src={image}
            alt={imageAlt ?? title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[color:var(--color-foreground-subtle)]">
            <svg
              width="48"
              height="48"
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
        {badge && (
          <div className="absolute left-2 top-2">
            <Badge tone={badgeTone} variant="solid" size="sm">
              {badge}
            </Badge>
          </div>
        )}
      </Wrapper>

      {/* Content */}
      <div className="p-4">
        {brand && (
          <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-[color:var(--color-foreground-muted)]">
            {brand}
          </p>
        )}
        <Wrapper
          {...(href ? { href } : {})}
          className={cn(
            "line-clamp-2 block text-sm font-semibold text-[color:var(--color-foreground)] transition-colors hover:text-[color:var(--color-primary)]",
            href && "focus-visible:outline-none",
          )}
        >
          {title}
        </Wrapper>

        {rating !== undefined && (
          <div className="mt-1.5">
            <RatingStars value={rating} size="sm" showValue showCount count={reviewCount} />
          </div>
        )}

        <div className="mt-2 flex items-center justify-between gap-2">
          <PriceDisplay price={price} originalPrice={originalPrice} currency={currency} size="md" />
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      </div>
    </div>
  );
}
