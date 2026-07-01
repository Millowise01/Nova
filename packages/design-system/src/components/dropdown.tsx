import type { PropsWithChildren } from "react";

export function Dropdown({ children }: PropsWithChildren) {
  return <div role="menu">{children}</div>;
}
