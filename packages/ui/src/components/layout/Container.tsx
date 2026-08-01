import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@nova/utils";

const containerVariants = cva("mx-auto w-full px-4 sm:px-6", {
  variants: {
    size: {
      sm: "max-w-[640px]",
      md: "max-w-[768px]",
      lg: "max-w-[1024px]",
      xl: "max-w-[1280px]",
      "2xl": "max-w-[1536px]",
      full: "max-w-none",
    },
  },
  defaultVariants: { size: "xl" },
});

export interface ContainerProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof containerVariants> {}

export function Container({ size, className, children, ...props }: ContainerProps) {
  return (
    <div className={cn(containerVariants({ size }), className)} {...props}>
      {children}
    </div>
  );
}
