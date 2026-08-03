import type { HTMLAttributes } from "react";

import { cn } from "@nova/utils";

export interface PaginationProps extends HTMLAttributes<HTMLElement> {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  showEdges?: boolean;
}

function range(start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

function getPages(page: number, total: number, siblings: number): (number | "...")[] {
  if (total <= 7) return range(1, total);

  const left = Math.max(2, page - siblings);
  const right = Math.min(total - 1, page + siblings);

  const showLeftDots = left > 2;
  const showRightDots = right < total - 1;

  if (!showLeftDots && showRightDots) {
    return [...range(1, 3 + siblings * 2), "...", total];
  }
  if (showLeftDots && !showRightDots) {
    return [1, "...", ...range(total - 2 - siblings * 2, total)];
  }
  return [1, "...", ...range(left, right), "...", total];
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  siblingCount = 1,
  showEdges: _showEdges = true,
  className,
  ...props
}: PaginationProps) {
  const pages = getPages(page, totalPages, siblingCount);

  return (
    <nav aria-label="Pagination" className={cn("flex items-center gap-1", className)} {...props}>
      <PaginationButton
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        ‹
      </PaginationButton>

      {pages.map((p, i) =>
        p === "..." ? (
          <span
            key={`dots-${i}`}
            className="px-2 text-sm text-[color:var(--color-foreground-muted)]"
            aria-hidden="true"
          >
            …
          </span>
        ) : (
          <PaginationButton
            key={p}
            onClick={() => onPageChange(p)}
            aria-current={p === page ? "page" : undefined}
            active={p === page}
          >
            {p}
          </PaginationButton>
        ),
      )}

      <PaginationButton
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
      >
        ›
      </PaginationButton>
    </nav>
  );
}

interface PaginationButtonProps extends HTMLAttributes<HTMLButtonElement> {
  disabled?: boolean;
  active?: boolean;
  "aria-current"?: "page" | undefined;
  "aria-label"?: string;
}

function PaginationButton({
  active,
  disabled,
  children,
  className,
  ...props
}: PaginationButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        "inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm font-medium transition-colors duration-100",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-border-focus)] focus-visible:ring-offset-1",
        "disabled:pointer-events-none disabled:opacity-40",
        active
          ? "bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)]"
          : "text-[color:var(--color-foreground-muted)] hover:bg-[color:var(--color-muted)] hover:text-[color:var(--color-foreground)]",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
