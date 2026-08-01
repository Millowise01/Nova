import type { HTMLAttributes, PropsWithChildren } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@nova/utils";
import { Skeleton } from "./skeleton";

const cardVariants = cva(
  "rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] text-[color:var(--color-foreground)]",
  {
    variants: {
      shadow: {
        none: "",
        sm: "shadow-sm",
        md: "shadow-md",
        lg: "shadow-lg",
      },
      interactive: {
        true: "cursor-pointer transition-shadow duration-200 hover:shadow-md hover:-translate-y-0.5 transition-transform",
        false: "",
      },
      padding: {
        none: "",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: { shadow: "sm", interactive: false, padding: "md" },
  },
);

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {
  loading?: boolean;
  asChild?: boolean;
}

export function Card({
  className,
  shadow,
  interactive,
  padding,
  loading,
  children,
  ...props
}: CardProps) {
  if (loading) {
    return (
      <div
        className={cn(cardVariants({ shadow, padding: "md" }), className)}
        aria-busy="true"
        {...props}
      >
        <Skeleton className="mb-3 h-5 w-2/3" />
        <Skeleton className="mb-2 h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    );
  }

  return (
    <div className={cn(cardVariants({ shadow, interactive, padding }), className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mb-4 flex items-start justify-between gap-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-base font-semibold text-[color:var(--color-foreground)]", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-[color:var(--color-foreground-muted)]", className)} {...props}>
      {children}
    </p>
  );
}

export function CardBody({
  className,
  children,
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div className={cn("", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "mt-4 flex items-center gap-3 border-t border-[color:var(--color-border)] pt-4",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
