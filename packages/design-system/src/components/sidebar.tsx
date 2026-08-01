import type { HTMLAttributes, PropsWithChildren } from "react";
import { cn } from "@nova/utils";

export type SidebarProps = HTMLAttributes<HTMLElement>;

export function Sidebar({ children, className, ...props }: PropsWithChildren<SidebarProps>) {
  return (
    <aside className={cn(className)} {...props}>
      {children}
    </aside>
  );
}
