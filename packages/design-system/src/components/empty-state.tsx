import { PackageSearch, ClipboardList, SearchX, BellOff } from "lucide-react";
import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@nova/utils";

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  children,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-[color:var(--color-border)] p-10 text-center",
        className,
      )}
      {...props}
    >
      {icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--color-muted)] text-[color:var(--color-foreground-muted)]">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-semibold text-[color:var(--color-foreground)]">{title}</h3>
      {description && (
        <p className="mt-1 max-w-xs text-sm text-[color:var(--color-foreground-muted)]">
          {description}
        </p>
      )}
      {(action || children) && <div className="mt-4">{action ?? children}</div>}
    </div>
  );
}

export type EmptyStatePresetProps = Partial<Pick<EmptyStateProps, "title" | "description">> &
  Omit<EmptyStateProps, "title" | "description">;

/** No products match the current catalog/filter view. */
export function NoProductsEmptyState({
  title = "No products found",
  description = "Try adjusting your filters or check back later for new arrivals.",
  icon = <PackageSearch size={20} aria-hidden="true" />,
  ...props
}: EmptyStatePresetProps) {
  return <EmptyState title={title} description={description} icon={icon} {...props} />;
}

/** No orders exist yet for this account/seller. */
export function NoOrdersEmptyState({
  title = "No orders yet",
  description = "Orders will show up here once a purchase is made.",
  icon = <ClipboardList size={20} aria-hidden="true" />,
  ...props
}: EmptyStatePresetProps) {
  return <EmptyState title={title} description={description} icon={icon} {...props} />;
}

/** A search or filter query returned zero results. */
export function NoResultsEmptyState({
  title = "No results found",
  description = "Try a different search term or clear your filters.",
  icon = <SearchX size={20} aria-hidden="true" />,
  ...props
}: EmptyStatePresetProps) {
  return <EmptyState title={title} description={description} icon={icon} {...props} />;
}

/** No notifications in the current view. */
export function NoNotificationsEmptyState({
  title = "You're all caught up",
  description = "New notifications will appear here.",
  icon = <BellOff size={20} aria-hidden="true" />,
  ...props
}: EmptyStatePresetProps) {
  return <EmptyState title={title} description={description} icon={icon} {...props} />;
}
