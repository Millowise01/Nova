import type { PropsWithChildren } from "react";

export function Dialog({ children }: PropsWithChildren) {
  return <div role="dialog" aria-modal="true">{children}</div>;
}
