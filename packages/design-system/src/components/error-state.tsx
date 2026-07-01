import type { PropsWithChildren } from "react";

export function ErrorState({ children }: PropsWithChildren) {
  return <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-900">{children}</div>;
}
