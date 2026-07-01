import type { HTMLAttributes } from "react";

export function Spinner(props: HTMLAttributes<HTMLDivElement>) {
  return <div aria-label="Loading" className="animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" {...props} />;
}
