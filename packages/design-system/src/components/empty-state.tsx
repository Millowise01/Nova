import type { PropsWithChildren } from "react";

export function EmptyState({ children }: PropsWithChildren) {
  return <div className="rounded-2xl border border-dashed p-8 text-center">{children}</div>;
}
