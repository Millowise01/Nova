import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";
import { cn } from "@nova/utils";

export interface TableProps extends HTMLAttributes<HTMLTableElement> {
  caption?: string;
  stickyHeader?: boolean;
}

export function Table({
  caption,
  stickyHeader: _stickyHeader,
  children,
  className,
  ...props
}: TableProps) {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-[color:var(--color-border)]">
      <table className={cn("w-full border-collapse text-sm", className)} {...props}>
        {caption && <caption className="sr-only">{caption}</caption>}
        {children}
      </table>
    </div>
  );
}

export function TableHead({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={cn("bg-[color:var(--color-muted)]", className)} {...props}>
      {children}
    </thead>
  );
}

export function TableBody({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody
      className={cn(
        "divide-y divide-[color:var(--color-border)] bg-[color:var(--color-surface-raised)]",
        className,
      )}
      {...props}
    >
      {children}
    </tbody>
  );
}

export function TableFoot({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tfoot
      className={cn(
        "border-t border-[color:var(--color-border)] bg-[color:var(--color-muted)] font-medium",
        className,
      )}
      {...props}
    >
      {children}
    </tfoot>
  );
}

export function TableRow({ children, className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn("transition-colors hover:bg-[color:var(--color-muted)]", className)}
      {...props}
    >
      {children}
    </tr>
  );
}

export interface TableHeaderCellProps extends ThHTMLAttributes<HTMLTableCellElement> {
  sortable?: boolean;
  sortDirection?: "asc" | "desc" | null;
  onSort?: () => void;
}

export function TableHeaderCell({
  sortable,
  sortDirection,
  onSort,
  children,
  className,
  ...props
}: TableHeaderCellProps) {
  return (
    <th
      scope="col"
      aria-sort={
        sortDirection === "asc" ? "ascending" : sortDirection === "desc" ? "descending" : undefined
      }
      className={cn(
        "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[color:var(--color-foreground-muted)]",
        sortable && "cursor-pointer select-none hover:text-[color:var(--color-foreground)]",
        className,
      )}
      onClick={sortable ? onSort : undefined}
      {...props}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        {sortable && (
          <span aria-hidden="true" className="text-[color:var(--color-foreground-subtle)]">
            {sortDirection === "asc" ? "↑" : sortDirection === "desc" ? "↓" : "↕"}
          </span>
        )}
      </span>
    </th>
  );
}

export function TableCell({
  children,
  className,
  ...props
}: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn("px-4 py-3 text-[color:var(--color-foreground)]", className)} {...props}>
      {children}
    </td>
  );
}
