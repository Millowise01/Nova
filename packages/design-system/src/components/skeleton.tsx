import type { HTMLAttributes } from "react";

export function Skeleton(props: HTMLAttributes<HTMLDivElement>) {
  return <div aria-hidden="true" className="animate-pulse rounded-xl bg-slate-200" {...props} />;
}
