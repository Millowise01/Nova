import type { PropsWithChildren } from "react";

export function Popover({ children }: PropsWithChildren) {
  return <div role="tooltip">{children}</div>;
}
