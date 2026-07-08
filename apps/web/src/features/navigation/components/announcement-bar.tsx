"use client";

import { useTranslations } from "next-intl";

export function AnnouncementBar() {
  const t = useTranslations("navigation");

  return (
    <div className="bg-[color:var(--ds-primary)] px-4 py-2 text-center text-xs font-semibold text-[color:var(--ds-primary-foreground)] md:text-sm">
      {t("announcement")}
    </div>
  );
}
