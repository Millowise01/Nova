import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@nova/utils";

import { Spinner } from "./spinner";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 font-semibold transition-colors duration-100",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-border-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-background)]",
    "disabled:pointer-events-none disabled:opacity-50 select-none",
  ],
  {
    variants: {
      variant: {
        primary:
          "bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)] hover:bg-[color:var(--color-primary-hover)] active:bg-[color:var(--color-primary-active)]",
        secondary:
          "bg-[color:var(--color-secondary)] text-[color:var(--color-secondary-foreground)] border border-[color:var(--color-secondary-border)] hover:bg-[color:var(--color-secondary-hover)] active:bg-[color:var(--color-secondary-active)]",
        accent:
          "bg-[color:var(--color-accent)] text-[color:var(--color-accent-foreground)] hover:bg-[color:var(--color-accent-hover)] active:bg-[color:var(--color-accent-active)]",
        outline:
          "border border-[color:var(--color-border)] bg-transparent text-[color:var(--color-foreground)] hover:bg-[color:var(--color-muted)] active:bg-[color:var(--color-muted)]",
        ghost:
          "bg-transparent text-[color:var(--color-foreground)] hover:bg-[color:var(--color-muted)] active:bg-[color:var(--color-muted)]",
        link: "bg-transparent px-0 text-[color:var(--color-primary)] underline-offset-4 hover:underline h-auto",
        danger:
          "bg-[color:var(--color-error)] text-[color:var(--color-error-foreground)] hover:bg-[color:var(--color-error-hover)] active:bg-[color:var(--color-error-active)]",
        success:
          "bg-[color:var(--color-success)] text-[color:var(--color-success-foreground)] hover:bg-[color:var(--color-success-hover)] active:bg-[color:var(--color-success-active)]",
      },
      size: {
        xs: "h-7 px-2.5 text-xs rounded-md",
        sm: "h-9 px-3 text-sm rounded-md",
        md: "h-10 px-4 text-sm rounded-md",
        lg: "h-11 px-5 text-base rounded-lg",
        xl: "h-12 px-6 text-base rounded-lg",
        icon: "h-10 w-10 rounded-md",
      },
      fullWidth: { true: "w-full", false: "w-auto" },
    },
    defaultVariants: { variant: "primary", size: "md", fullWidth: false },
  },
);

export type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>["variant"]>;
export type ButtonSize = NonNullable<VariantProps<typeof buttonVariants>["size"]>;

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
}

export function Button({
  className,
  variant,
  size,
  fullWidth,
  loading = false,
  icon,
  iconPosition = "left",
  children,
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      aria-disabled={isDisabled || undefined}
      {...props}
    >
      {loading && (
        <Spinner
          size="sm"
          tone={variant === "outline" || variant === "ghost" ? "primary" : "white"}
        />
      )}
      {!loading && icon && iconPosition === "left" && <span aria-hidden="true">{icon}</span>}
      {children && <span>{children}</span>}
      {!loading && icon && iconPosition === "right" && <span aria-hidden="true">{icon}</span>}
    </button>
  );
}
