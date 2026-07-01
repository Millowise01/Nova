import type { PropsWithChildren } from "react";

export function Drawer({ children }: PropsWithChildren) {
  return <aside aria-hidden="false">{children}</aside>;
}
