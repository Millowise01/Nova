import type { HTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@nova/utils";

export function Menu({ children, className, ...props }: HTMLAttributes<HTMLUListElement>) {
  return (
    <ul role="menu" className={cn("py-1", className)} {...props}>
      {children}
    </ul>
  );
}

export interface MenuItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  destructive?: boolean;
}

export function MenuItem({ icon, destructive, children, className, ...props }: MenuItemProps) {
  return (
    <li role="none">
      <button
        role="menuitem"
        type="button"
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
        {children}
      </button>
    </li>
  );
}

export function MenuSeparator({ className }: { className?: string }) {
  return (
    <li role="separator" className={cn("my-1 h-px bg-[color:var(--color-border)]", className)} />
  );
}

export function MenuLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <li
      className={cn(
        "px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[color:var(--color-foreground-muted)]",
        className,
      )}
    >
      {children}
    </li>
  );
}
