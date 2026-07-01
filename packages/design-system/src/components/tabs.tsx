import type { PropsWithChildren } from "react";

export function Tabs({ children }: PropsWithChildren) {
  return <div role="tablist">{children}</div>;
}
