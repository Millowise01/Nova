import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@nova/utils";

export interface NavbarProps extends HTMLAttributes<HTMLElement> {
  logo?: ReactNode;
  actions?: ReactNode;
  sticky?: boolean;
}

export function Navbar({ logo, actions, sticky, children, className, ...props }: NavbarProps) {
  return (
    <header
      className={cn(
        "z-[1100] w-full bg-[color:var(--color-surface-nav)] text-[color:var(--color-foreground-on-dark)]",
        sticky && "sticky top-0",
        className,
      )}
      {...props}
    >
      <div className="mx-auto flex h-16 max-w-[1280px] items-center gap-4 px-4 sm:px-6">
        {logo && <div className="shrink-0">{logo}</div>}
        {children && <nav className="flex flex-1 items-center gap-1">{children}</nav>}
        {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}

export interface NavbarItemProps extends HTMLAttributes<HTMLAnchorElement> {
  href?: string;
  active?: boolean;
  icon?: ReactNode;
}

export function NavbarItem({
  href = "#",
  active,
  icon,
  children,
  className,
  ...props
}: NavbarItemProps) {
  return (
    <a
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-100",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
        active ? "bg-white/15 text-white" : "text-white/80 hover:bg-white/10 hover:text-white",
        className,
      )}
      {...props}
    >
      {icon && <span aria-hidden="true">{icon}</span>}
      {children}
    </a>
  );
}
