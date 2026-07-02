import type { PropsWithChildren } from "react";

export function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-xl items-center px-4 py-12 md:px-6">
      {children}
    </div>
  );
}
