import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@nova/utils";

const skeletonVariants = cva("animate-pulse bg-[color:var(--color-muted)]", {
  variants: {
    shape: {
      rectangle: "rounded-md",
      circle: "rounded-full",
      text: "rounded h-4",
    },
  },
  defaultVariants: { shape: "rectangle" },
});

export interface SkeletonProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof skeletonVariants> {}

export function Skeleton({ shape, className, ...props }: SkeletonProps) {
  return (
    <div aria-hidden="true" className={cn(skeletonVariants({ shape }), className)} {...props} />
  );
}

/** Convenience: a block of skeleton text lines */
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} shape="text" className={i === lines - 1 ? "w-3/4" : "w-full"} />
      ))}
    </div>
  );
}
