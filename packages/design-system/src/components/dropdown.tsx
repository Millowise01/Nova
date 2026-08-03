"use client";

import { Check } from "lucide-react";
import {
  useState,
  useRef,
  useEffect,
  useCallback,
  createContext,
  useContext,
  type HTMLAttributes,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";

import { cn } from "@nova/utils";

interface DropdownContextValue {
  open: boolean;
  close: () => void;
}

const DropdownContext = createContext<DropdownContextValue | null>(null);

export interface DropdownProps {
  children: ReactNode;
  className?: string;
}

export function Dropdown({ children, className }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    if (open) {
      document.addEventListener("mousedown", onOutside);
      document.addEventListener("keydown", onEsc);
    }
    return () => {
      document.removeEventListener("mousedown", onOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open, close]);

  return (
    <DropdownContext.Provider value={{ open, close }}>
      <div ref={ref} className={cn("relative inline-block", className)}>
        {typeof children === "function"
          ? (children as (props: { open: boolean; toggle: () => void }) => ReactNode)({
              open,
              toggle: () => setOpen((v) => !v),
            })
          : children}
      </div>
    </DropdownContext.Provider>
  );
}

export interface DropdownTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  onToggle?: () => void;
}

export function DropdownTrigger({
  children,
  className,
  onClick,
  onToggle,
  ...props
}: DropdownTriggerProps) {
  return (
    <button
      type="button"
      aria-haspopup="menu"
      onClick={(e) => {
        onClick?.(e);
        onToggle?.();
      }}
      className={cn(
        "rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-border-focus)] focus-visible:ring-offset-1",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export interface DropdownMenuProps extends HTMLAttributes<HTMLDivElement> {
  open: boolean;
  align?: "start" | "end";
  width?: "auto" | "trigger" | number;
}

export function DropdownMenu({
  open,
  align = "start",
  width = "auto",
  children,
  className,
  ...props
}: DropdownMenuProps) {
  if (!open) return null;

  return (
    <div
      role="menu"
      aria-orientation="vertical"
      className={cn(
        "absolute z-[1000] mt-1 min-w-[10rem] animate-[nova-scale-in_150ms_ease-out_both] rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-raised)] py-1 shadow-lg",
        align === "end" ? "right-0" : "left-0",
        className,
      )}
      style={typeof width === "number" ? { width } : undefined}
      {...props}
    >
      {children}
    </div>
  );
}

export interface DropdownItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  checked?: boolean;
  destructive?: boolean;
}

export function DropdownItem({
  icon,
  checked,
  destructive,
  children,
  className,
  onClick,
  ...props
}: DropdownItemProps) {
  const ctx = useContext(DropdownContext);

  return (
    <button
      role="menuitem"
      type="button"
      onClick={(e) => {
        onClick?.(e);
        ctx?.close();
      }}
      className={cn(
        "flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors duration-75",
        "focus-visible:bg-[color:var(--color-muted)] focus-visible:outline-none",
        destructive
          ? "text-[color:var(--color-error)] hover:bg-[color:var(--color-error-subtle)]"
          : "text-[color:var(--color-foreground)] hover:bg-[color:var(--color-muted)]",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {icon && (
        <span aria-hidden="true" className="shrink-0">
          {icon}
        </span>
      )}
      <span className="flex-1 text-left">{children}</span>
      {checked && <Check size={14} aria-hidden="true" className="shrink-0" />}
    </button>
  );
}

export function DropdownSeparator({ className }: { className?: string }) {
  return (
    <div role="separator" className={cn("my-1 h-px bg-[color:var(--color-border)]", className)} />
  );
}

export function DropdownLabel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[color:var(--color-foreground-muted)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
