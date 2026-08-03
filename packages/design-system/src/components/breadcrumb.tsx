import { ChevronRight, Home } from "lucide-react";
import type { HTMLAttributes, ReactNode } from "react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: ReactNode;
}

export interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
  separator?: ReactNode;
  showHome?: boolean;
}

export function Breadcrumb({
  items,
  separator,
  showHome = false,
  className,
  ...props
}: BreadcrumbProps) {
  const sep = separator ?? (
    <ChevronRight
      size={14}
      aria-hidden="true"
      className="text-[color:var(--color-foreground-subtle)]"
    />
  );

  return (
    <nav aria-label="Breadcrumb" className={className} {...props}>
      <ol className="flex flex-wrap items-center gap-1 text-sm">
        {showHome && (
          <>
            <li>
              <a
                href="/"
                aria-label="Home"
                className="flex items-center rounded text-[color:var(--color-foreground-muted)] transition-colors hover:text-[color:var(--color-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-border-focus)]"
              >
                <Home size={14} aria-hidden="true" />
              </a>
            </li>
            {items.length > 0 && (
              <li aria-hidden="true" className="flex items-center">
                {sep}
              </li>
            )}
          </>
        )}

        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-1">
              {isLast ? (
                <span
                  aria-current="page"
                  className="flex items-center gap-1 font-medium text-[color:var(--color-foreground)]"
                >
                  {item.icon && <span aria-hidden="true">{item.icon}</span>}
                  {item.label}
                </span>
              ) : (
                <>
                  <a
                    href={item.href ?? "#"}
                    className="flex items-center gap-1 rounded text-[color:var(--color-foreground-muted)] transition-colors hover:text-[color:var(--color-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-border-focus)]"
                  >
                    {item.icon && <span aria-hidden="true">{item.icon}</span>}
                    {item.label}
                  </a>
                  <span aria-hidden="true" className="flex items-center">
                    {sep}
                  </span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
