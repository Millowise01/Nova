import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@nova/utils";

export interface BottomNavProps extends HTMLAttributes<HTMLElement> {
  label?: string;
}

/** Fixed bottom tab bar for mobile viewports. */
export function BottomNav({ label = "Primary", children, className, ...props }: BottomNavProps) {
  return (
    <nav
      aria-label={label}
      className={cn(
        "fixed inset-x-0 bottom-0 z-[1100] flex items-stretch border-t border-[color:var(--color-border)] bg-[color:var(--color-surface-raised)] pb-[env(safe-area-inset-bottom)]",
        className,
      )}
      {...props}
    >
      {children}
    </nav>
  );
}

export interface BottomNavItemProps extends HTMLAttributes<HTMLAnchorElement> {
  href?: string;
  active?: boolean;
  icon: ReactNode;
  badge?: ReactNode;
}

export function BottomNavItem({
  href = "#",
  active,
  icon,
  badge,
  children,
  className,
  ...props
}: BottomNavItemProps) {
  return (
    <a
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium transition-colors duration-100",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color:var(--color-border-focus)]",
        active
          ? "text-[color:var(--color-primary)]"
          : "text-[color:var(--color-foreground-muted)] hover:text-[color:var(--color-foreground)]",
        className,
      )}
      {...props}
    >
      <span aria-hidden="true" className="relative">
        {icon}
        {badge && <span className="absolute -right-2 -top-1.5">{badge}</span>}
      </span>
      {children}
    </a>
  );
}
