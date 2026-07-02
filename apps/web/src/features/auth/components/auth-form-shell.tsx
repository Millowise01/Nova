import type { PropsWithChildren, ReactNode } from "react";
import { Card } from "@nova/ui";

export function AuthFormShell({ title, subtitle, footer, children }: PropsWithChildren<{ title: string; subtitle: string; footer?: ReactNode }>) {
  return (
    <Card className="w-full space-y-5">
      <header>
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
      </header>
      {children}
      {footer ? <footer className="text-sm text-slate-600">{footer}</footer> : null}
    </Card>
  );
}
