import type { HTMLAttributes, PropsWithChildren } from "react";
import { cn } from "@nova/utils";

export interface SidebarProps extends HTMLAttributes<HTMLElement> {}

export function Sidebar({ children, className, ...props }: PropsWithChildren<SidebarProps>) {
  return (
    <aside className={cn(className)} {...props}>
      {children}
    </aside>
  );
}
