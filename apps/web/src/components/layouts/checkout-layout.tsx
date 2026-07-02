import type { PropsWithChildren } from "react";

export function CheckoutLayout({ children }: PropsWithChildren) {
  return <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 lg:px-8">{children}</div>;
}
