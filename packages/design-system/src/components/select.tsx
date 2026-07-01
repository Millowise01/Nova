import type { SelectHTMLAttributes } from "react";
import { cn } from "@nova/utils";

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn("h-11 w-full rounded-xl border border-[color:var(--ds-border)] bg-white px-4 text-sm", className)}
      {...props}
    >
      {children}
    </select>
  );
}
