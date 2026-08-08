import type { HTMLAttributes } from "react";

import { cn } from "@nova/utils";

import { Spinner } from "./spinner";

export interface LoadingOverlayProps extends HTMLAttributes<HTMLDivElement> {
  label?: string;
  /** "absolute" covers the nearest positioned ancestor; "fixed" covers the viewport. */
  position?: "absolute" | "fixed";
  visible?: boolean;
}

/** Backdrop + spinner surface for blocking loading states over a section or the full viewport. */
export function LoadingOverlay({
  label = "Loading",
  position = "absolute",
  visible = true,
  className,
  ...props
}: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <div
      aria-busy="true"
      className={cn(
        "inset-0 z-[1200] flex flex-col items-center justify-center gap-3 bg-[color:var(--color-surface-overlay)]",
        position,
        className,
      )}
      {...props}
    >
      <Spinner size="lg" tone="primary" label={label} />
      {label && (
        <p aria-hidden="true" className="text-sm font-medium text-[color:var(--color-foreground)]">
          {label}
        </p>
      )}
    </div>
  );
}
