"use client";

import { useEffect, useRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@nova/utils";
import { X } from "lucide-react";

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  side?: "left" | "right";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sideClasses = {
  left: "left-0 top-0 h-full animate-[nova-slide-in-left_300ms_var(--ease-spring)_both]",
  right: "right-0 top-0 h-full animate-[nova-slide-in-right_300ms_var(--ease-spring)_both]",
};

const sizeClasses = {
  sm: "w-72",
  md: "w-80",
  lg: "w-96",
};

export function Drawer({
  open,
  onClose,
  children,
  side = "right",
  size = "md",
  className,
}: DrawerProps) {
  const ref = useRef<HTMLElement>(null);

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
    <div className="fixed inset-0 z-[1200]" aria-modal="true" role="dialog">
      {/* Backdrop */}
      <div
        className="absolute inset-0 animate-[nova-fade-in_200ms_ease-out_both] bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        ref={ref}
        tabIndex={-1}
        className={cn(
          "absolute flex flex-col bg-[color:var(--color-surface-raised)] shadow-xl outline-none",
          sideClasses[side],
          sizeClasses[size],
          className,
        )}
      >
        {children}
      </aside>
    </div>
  );
}

export function DrawerHeader({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-between gap-4 border-b border-[color:var(--color-border)] px-5 py-4",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function DrawerTitle({ children, className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn("text-base font-semibold text-[color:var(--color-foreground)]", className)}
      {...props}
    >
      {children}
    </h2>
  );
}

export function DrawerBody({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex-1 overflow-y-auto px-5 py-4", className)} {...props}>
      {children}
    </div>
  );
}

export function DrawerFooter({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("shrink-0 border-t border-[color:var(--color-border)] px-5 py-4", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export interface DrawerCloseProps {
  onClose: () => void;
  className?: string;
}

export function DrawerClose({ onClose, className }: DrawerCloseProps) {
  return (
    <button
      type="button"
      onClick={onClose}
      aria-label="Close drawer"
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
