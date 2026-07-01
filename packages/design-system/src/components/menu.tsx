import type { PropsWithChildren } from "react";

export function Menu({ children }: PropsWithChildren) {
  return <ul role="menu">{children}</ul>;
}
