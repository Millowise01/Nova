import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";

import { cn } from "@nova/utils";

const badgeVariants = cva("inline-flex items-center gap-1 font-semibold leading-none", {
  variants: {
    tone: {
      neutral: "bg-[color:var(--color-muted)] text-[color:var(--color-foreground)]",
      primary: "bg-[color:var(--color-primary-subtle)] text-[color:var(--color-primary)]",
      accent: "bg-[color:var(--color-accent-subtle)] text-[color:var(--color-accent)]",
      success: "bg-[color:var(--color-success-subtle)] text-[color:var(--color-success)]",
      warning: "bg-[color:var(--color-warning-subtle)] text-[color:var(--color-warning)]",
      error: "bg-[color:var(--color-error-subtle)] text-[color:var(--color-error)]",
      info: "bg-[color:var(--color-info-subtle)] text-[color:var(--color-info)]",
    },
    variant: {
      soft: "",
      solid: "",
      outline: "bg-transparent border",
    },
    size: {
      sm: "px-2 py-0.5 text-xs rounded-md",
      md: "px-2.5 py-1 text-xs rounded-md",
      lg: "px-3 py-1 text-sm rounded-lg",
    },
  },
  compoundVariants: [
    {
      tone: "neutral",
      variant: "solid",
      className: "bg-[color:var(--color-foreground)] text-[color:var(--color-background)]",
    },
    {
      tone: "primary",
      variant: "solid",
      className: "bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)]",
    },
    {
      tone: "accent",
      variant: "solid",
      className: "bg-[color:var(--color-accent)] text-[color:var(--color-accent-foreground)]",
    },
    {
      tone: "success",
      variant: "solid",
      className: "bg-[color:var(--color-success)] text-[color:var(--color-success-foreground)]",
    },
    {
      tone: "warning",
      variant: "solid",
      className: "bg-[color:var(--color-warning)] text-[color:var(--color-warning-foreground)]",
    },
    {
      tone: "error",
      variant: "solid",
      className: "bg-[color:var(--color-error)] text-[color:var(--color-error-foreground)]",
    },
    {
      tone: "info",
      variant: "solid",
      className: "bg-[color:var(--color-info)] text-[color:var(--color-info-foreground)]",
    },
    {
      tone: "neutral",
      variant: "outline",
      className: "border-[color:var(--color-border)] text-[color:var(--color-foreground-muted)]",
    },
    {
      tone: "primary",
      variant: "outline",
      className: "border-[color:var(--color-primary-border)] text-[color:var(--color-primary)]",
    },
    {
      tone: "error",
      variant: "outline",
      className: "border-[color:var(--color-error-border)] text-[color:var(--color-error)]",
    },
  ],
  defaultVariants: { tone: "neutral", variant: "soft", size: "md" },
});

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export function Badge({ className, tone, variant, size, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ tone, variant, size }), className)} {...props}>
      {dot && <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
