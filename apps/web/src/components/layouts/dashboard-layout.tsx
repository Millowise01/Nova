"use client";

import { useTranslations } from "next-intl";
import type { PropsWithChildren } from "react";

import { Sidebar } from "@nova/ui";

export function DashboardLayout({ children }: PropsWithChildren) {
  const t = useTranslations("dashboard");

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 md:grid-cols-[18rem_minmax(0,1fr)] md:px-6 lg:px-8">
      <Sidebar className="rounded-2xl border border-[color:var(--ds-border)] bg-[color:var(--ds-surface)] p-4">
        <p className="text-sm font-semibold">{t("title")}</p>
      </Sidebar>
      <section>{children}</section>
    </div>
  );
}
