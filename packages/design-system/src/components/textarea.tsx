import type { TextareaHTMLAttributes } from "react";
import { cn } from "@nova/utils";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export function Textarea({ className, error, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none transition",
        error ? "border-[color:var(--ds-danger)]" : "border-[color:var(--ds-border)]",
        className
      )}
      aria-invalid={error || undefined}
      {...props}
    />
  );
}
