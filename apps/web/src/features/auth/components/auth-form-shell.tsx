import Link from "next/link";
import type { PropsWithChildren, ReactNode } from "react";

import { Card } from "@nova/ui";
export function AuthFormShell({
  title,
  subtitle,
  footer,
  children,
}: PropsWithChildren<{ title: string; subtitle: string; footer?: ReactNode }>) {
  return (
    <div className="w-full space-y-6">
      {/* Logo */}
      <div className="flex justify-center">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[color:var(--color-surface-nav)] text-sm font-bold text-white">
            N
          </span>
          <span className="text-lg font-bold text-[color:var(--color-foreground)]">Nova</span>
        </Link>
      </div>

      <Card className="rounded-xl p-8">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-[color:var(--color-foreground)]">{title}</h1>
          <p className="mt-1 text-sm text-[color:var(--color-foreground-muted)]">{subtitle}</p>
        </header>

        {children}

        {footer ? (
          <footer className="mt-5 border-t border-[color:var(--color-border)] pt-5 text-sm text-[color:var(--color-foreground-muted)]">
            {footer}
          </footer>
        ) : null}
      </Card>
    </div>
  );
}
