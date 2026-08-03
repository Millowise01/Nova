import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";

import { cn } from "@nova/utils";

const spinnerVariants = cva("animate-spin rounded-full border-2 border-t-transparent", {
  variants: {
    size: {
      xs: "h-3 w-3",
      sm: "h-4 w-4",
      md: "h-5 w-5",
      lg: "h-6 w-6",
      xl: "h-8 w-8",
    },
    tone: {
      default: "border-[color:var(--color-foreground-subtle)] border-t-transparent",
      primary: "border-[color:var(--color-primary)] border-t-transparent",
      white: "border-white/40 border-t-white",
      accent: "border-[color:var(--color-accent)] border-t-transparent",
    },
  },
  defaultVariants: { size: "md", tone: "default" },
});

export interface SpinnerProps
  extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof spinnerVariants> {
  label?: string;
}

export function Spinner({ size, tone, label = "Loading", className, ...props }: SpinnerProps) {
  return (
    <span role="status" aria-label={label} className={cn("inline-flex", className)} {...props}>
      <span className={cn(spinnerVariants({ size, tone }))} />
      <span className="sr-only">{label}</span>
    </span>
  );
}
