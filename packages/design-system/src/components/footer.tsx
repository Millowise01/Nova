import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@nova/utils";

export interface FooterProps extends HTMLAttributes<HTMLElement> {
  logo?: ReactNode;
  columns?: ReactNode;
  bottom?: ReactNode;
}

export function Footer({ logo, columns, bottom, children, className, ...props }: FooterProps) {
  return (
    <footer
      className={cn(
        "bg-[color:var(--color-surface-footer)] text-[color:var(--color-foreground-on-dark)]",
        className,
      )}
      {...props}
    >
      {(logo || columns || children) && (
        <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6">
          {logo && <div className="mb-8">{logo}</div>}
          {columns && <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">{columns}</div>}
          {children}
        </div>
      )}
      {bottom && (
        <div className="border-t border-white/10">
          <div className="mx-auto max-w-[1280px] px-4 py-4 sm:px-6">{bottom}</div>
        </div>
      )}
    </footer>
  );
}

export function FooterColumn({
  title,
  children,
  className,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {title && (
        <h3 className="text-xs font-semibold uppercase tracking-wider text-white/60">{title}</h3>
      )}
      <ul className="space-y-2">{children}</ul>
    </div>
  );
}

export function FooterLink({
  href = "#",
  children,
  className,
}: {
  href?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <li>
      <a
        href={href}
        className={cn(
          "rounded text-sm text-white/70 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
          className,
        )}
      >
        {children}
      </a>
    </li>
  );
}
