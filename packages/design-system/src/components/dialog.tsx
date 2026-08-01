"use client";

import { useEffect, useRef, useId, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@nova/utils";
import { X } from "lucide-react";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
  full: "max-w-[calc(100vw-2rem)]",
};

export function Dialog({ open, onClose, children, size = "md", className }: DialogProps) {
  const titleId = useId();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    return () => prev?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1300] flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby={titleId}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 animate-[nova-fade-in_150ms_ease-out_both] bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={ref}
        tabIndex={-1}
        className={cn(
          "relative z-10 w-full rounded-xl bg-[color:var(--color-surface-raised)] shadow-xl outline-none",
          "animate-[nova-scale-in_200ms_var(--ease-spring)_both]",
          sizeClasses[size],
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 border-b border-[color:var(--color-border)] px-6 py-4",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function DialogTitle({ children, className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn("text-base font-semibold text-[color:var(--color-foreground)]", className)}
      {...props}
    >
      {children}
    </h2>
  );
}

export function DialogDescription({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("mt-1 text-sm text-[color:var(--color-foreground-muted)]", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function DialogBody({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-6 py-4", className)} {...props}>
      {children}
    </div>
  );
}

export function DialogFooter({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-3 border-t border-[color:var(--color-border)] px-6 py-4",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface DialogCloseProps {
  onClose: () => void;
  className?: string;
}

export function DialogClose({ onClose, className }: DialogCloseProps) {
  return (
    <button
      type="button"
      onClick={onClose}
      aria-label="Close dialog"
      className={cn(
        "rounded p-1 text-[color:var(--color-foreground-muted)] transition-colors hover:bg-[color:var(--color-muted)] hover:text-[color:var(--color-foreground)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-border-focus)]",
        className,
      )}
    >
      <X size={18} aria-hidden="true" />
    </button>
  );
}
