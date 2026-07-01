import type { PropsWithChildren } from "react";

export function Alert({ children }: PropsWithChildren) {
  return <div role="alert" className="rounded-xl border border-[color:var(--ds-border)] bg-[color:var(--ds-surface)] p-4">{children}</div>;
}
