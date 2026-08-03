import { Star, StarHalf } from "lucide-react";
import type { HTMLAttributes } from "react";

import { cn } from "@nova/utils";

export interface RatingStarsProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  count?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  showCount?: boolean;
  interactive?: boolean;
  onRate?: (value: number) => void;
}

const sizeMap = { sm: 12, md: 16, lg: 20 };

export function RatingStars({
  value,
  max = 5,
  count,
  size = "md",
  showValue = false,
  showCount = false,
  interactive = false,
  onRate,
  className,
  ...props
}: RatingStarsProps) {
  const px = sizeMap[size];
  const rounded = Math.round(value * 2) / 2;

  return (
    <div
      className={cn("inline-flex items-center gap-1", className)}
      role={interactive ? "radiogroup" : undefined}
      aria-label={`Rating: ${value} out of ${max}`}
      {...props}
    >
      <span className="flex items-center gap-0.5">
        {Array.from({ length: max }).map((_, i) => {
          const filled = i + 1 <= rounded;
          const half = !filled && i + 0.5 === rounded;

          if (interactive) {
            return (
              <button
                key={i}
                type="button"
                role="radio"
                aria-checked={i + 1 === Math.round(value)}
                aria-label={`${i + 1} star${i !== 0 ? "s" : ""}`}
                onClick={() => onRate?.(i + 1)}
                className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-border-focus)]"
              >
                <Star
                  size={px}
                  aria-hidden="true"
                  className={cn(
                    "transition-colors",
                    filled
                      ? "fill-[color:var(--color-warning)] text-[color:var(--color-warning)]"
                      : "fill-transparent text-[color:var(--color-border)]",
                  )}
                />
              </button>
            );
          }

          return (
            <span key={i} aria-hidden="true">
              {half ? (
                <StarHalf
                  size={px}
                  className="fill-[color:var(--color-warning)] text-[color:var(--color-warning)]"
                />
              ) : (
                <Star
                  size={px}
                  className={cn(
                    filled
                      ? "fill-[color:var(--color-warning)] text-[color:var(--color-warning)]"
                      : "fill-transparent text-[color:var(--color-border)]",
                  )}
                />
              )}
            </span>
          );
        })}
      </span>

      {showValue && (
        <span className="text-sm font-semibold text-[color:var(--color-foreground)]">
          {value.toFixed(1)}
        </span>
      )}
      {showCount && count !== undefined && (
        <span className="text-sm text-[color:var(--color-foreground-muted)]">
          ({count.toLocaleString()})
        </span>
      )}
    </div>
  );
}
