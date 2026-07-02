import type { InputHTMLAttributes } from "react";
import { cn } from "@nova/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  errorId?: string;
}

export function Input({ className, error, errorId, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-xl border bg-white px-4 text-sm text-slate-950 shadow-sm outline-none transition",
        "placeholder:text-slate-400 focus-visible:border-[color:var(--ds-focus)] focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus)]",
        error ? "border-[color:var(--ds-danger)]" : "border-[color:var(--ds-border)]",
        className
      )}
      aria-invalid={error || undefined}
      aria-describedby={error && errorId ? errorId : undefined}
      {...props}
    />
  );
}
