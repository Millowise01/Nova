import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@nova/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--ds-focus)]",
    "disabled:pointer-events-none disabled:opacity-50"
  ],
  {
    variants: {
      variant: {
        primary: "bg-[color:var(--ds-primary)] text-[color:var(--ds-primary-foreground)] hover:opacity-95",
        secondary: "bg-[color:var(--ds-secondary)] text-[color:var(--ds-secondary-foreground)] hover:opacity-95",
        outline: "border border-[color:var(--ds-border)] bg-transparent text-[color:var(--ds-text)] hover:bg-[color:var(--ds-surface)]",
        ghost: "bg-transparent text-[color:var(--ds-text)] hover:bg-[color:var(--ds-surface)]",
        link: "bg-transparent px-0 text-[color:var(--ds-primary)] underline-offset-4 hover:underline",
        danger: "bg-[color:var(--ds-danger)] text-white hover:opacity-95",
        success: "bg-[color:var(--ds-success)] text-white hover:opacity-95"
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-11 px-4 text-sm",
        lg: "h-12 px-5 text-base",
        xl: "h-14 px-6 text-base"
      },
      fullWidth: {
        true: "w-full",
        false: "w-auto"
      },
      loading: {
        true: "cursor-wait",
        false: ""
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false,
      loading: false
    }
  }
);

export type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];
export type ButtonSize = VariantProps<typeof buttonVariants>["size"];

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  icon?: ReactNode;
}

export function Button({ className, variant, size, fullWidth, loading, icon, children, disabled, ...props }: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button className={cn(buttonVariants({ variant, size, fullWidth, loading }), className)} disabled={isDisabled} {...props}>
      {loading ? <span aria-hidden="true">•</span> : icon}
      <span>{children}</span>
    </button>
  );
}
