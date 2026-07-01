import type { PropsWithChildren } from "react";

export function Pagination({ children }: PropsWithChildren) {
  return <nav aria-label="Pagination">{children}</nav>;
}
