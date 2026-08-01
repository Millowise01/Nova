import type { HTMLAttributes } from "react";
import { cn } from "@nova/utils";

export function VisuallyHidden({ children, className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn("sr-only", className)} {...props}>
      {children}
    </span>
  );
}
