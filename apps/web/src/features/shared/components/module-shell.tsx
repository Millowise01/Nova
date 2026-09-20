import type { ReactNode } from "react";

import { Card } from "@nova/ui";
export function ModuleShell({
  title,
  subtitle,
  children,
  actions,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[color:var(--color-foreground)]">
            {title}
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-[color:var(--color-foreground-muted)]">
            {subtitle}
          </p>
        </div>
        {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
      </div>
      <Card className="space-y-6 rounded-xl p-6">{children}</Card>
    </section>
  );
}
