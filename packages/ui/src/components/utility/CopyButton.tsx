"use client";

import { useState, type HTMLAttributes } from "react";
import { cn } from "@nova/utils";
import { Copy, Check } from "lucide-react";

export interface CopyButtonProps extends HTMLAttributes<HTMLButtonElement> {
  value: string;
  label?: string;
  successLabel?: string;
  size?: "sm" | "md";
  iconOnly?: boolean;
}

export function CopyButton({
  value,
  label = "Copy",
  successLabel = "Copied!",
  size = "md",
  iconOnly = false,
  className,
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard
      .writeText(value)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => undefined);
  }

  const sizeClasses = {
    sm: "h-7 gap-1.5 px-2 text-xs rounded",
    md: "h-9 gap-2 px-3 text-sm rounded-md",
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? successLabel : label}
      className={cn(
        "inline-flex items-center justify-center font-medium transition-colors duration-100",
        "border border-[color:var(--color-border)] bg-[color:var(--color-surface)] text-[color:var(--color-foreground-muted)]",
        "hover:bg-[color:var(--color-muted)] hover:text-[color:var(--color-foreground)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-border-focus)]",
        copied && "border-[color:var(--color-success-border)] text-[color:var(--color-success)]",
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {copied ? (
        <Check size={size === "sm" ? 12 : 14} aria-hidden="true" />
      ) : (
        <Copy size={size === "sm" ? 12 : 14} aria-hidden="true" />
      )}
      {!iconOnly && <span>{copied ? successLabel : label}</span>}
    </button>
  );
}
