import type { PropsWithChildren } from "react";

export function Breadcrumb({ children }: PropsWithChildren) {
  return <nav aria-label="Breadcrumb"><ol className="flex flex-wrap items-center gap-2">{children}</ol></nav>;
}
