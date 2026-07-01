import type { PropsWithChildren } from "react";

export function Navbar({ children }: PropsWithChildren) {
  return <header>{children}</header>;
}
