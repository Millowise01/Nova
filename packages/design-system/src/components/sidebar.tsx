import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@nova/utils";

export interface SidebarProps extends HTMLAttributes<HTMLElement> {
  collapsed?: boolean;
  width?: "sm" | "md" | "lg";
}

const widthClasses = { sm: "w-56", md: "w-64", lg: "w-72" };

export function Sidebar({ collapsed, width = "md", children, className, ...props }: SidebarProps) {
  return (
    <aside
      className={cn(
        "flex flex-col border-r border-[color:var(--color-border)] bg-[color:var(--color-surface)] transition-all duration-300",
        collapsed ? "w-16" : widthClasses[width],
        className,
      )}
      {...props}
    >
      {children}
    </aside>
  );
}

export function SidebarHeader({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("shrink-0 border-b border-[color:var(--color-border)] px-4 py-4", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function SidebarBody({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex-1 overflow-y-auto px-3 py-3", className)} {...props}>
      {children}
    </div>
  );
}

export function SidebarFooter({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("shrink-0 border-t border-[color:var(--color-border)] px-3 py-3", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function SidebarSection({
  label,
  children,
  className,
}: {
  label?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-4", className)}>
      {label && (
        <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wide text-[color:var(--color-foreground-subtle)]">
          {label}
        </p>
      )}
      <ul role="list" className="space-y-0.5">
        {children}
      </ul>
    </div>
  );
}

export interface SidebarItemProps extends HTMLAttributes<HTMLAnchorElement> {
  href?: string;
  active?: boolean;
  icon?: ReactNode;
  badge?: ReactNode;
  collapsed?: boolean;
}

export function SidebarItem({
  href = "#",
  active,
  icon,
  badge,
  collapsed,
  children,
  className,
  ...props
}: SidebarItemProps) {
  return (
    <li>
      <a
        href={href}
        aria-current={active ? "page" : undefined}
        title={collapsed && typeof children === "string" ? children : undefined}
        className={cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-100",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-border-focus)]",
          active
            ? "bg-[color:var(--color-primary-subtle)] text-[color:var(--color-primary)]"
            : "text-[color:var(--color-foreground-muted)] hover:bg-[color:var(--color-muted)] hover:text-[color:var(--color-foreground)]",
          className,
        )}
        {...(props)}
      >
        {icon && (
          <span aria-hidden="true" className="shrink-0">
            {icon}
          </span>
        )}
        {!collapsed && <span className="flex-1 truncate">{children}</span>}
        {!collapsed && badge && <span className="shrink-0">{badge}</span>}
      </a>
    </li>
  );
}
