import type { PropsWithChildren, HTMLAttributes } from "react";
import { cn } from "@nova/utils";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export function Card({ className, children, ...props }: PropsWithChildren<CardProps>) {
  return <div className={cn("rounded-2xl border border-[color:var(--ds-border)] bg-white p-6 shadow-sm", className)} {...props}>{children}</div>;
}
