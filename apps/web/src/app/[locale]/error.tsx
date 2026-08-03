"use client";

import { useTranslations } from "next-intl";

import { Button, ErrorState } from "@nova/ui";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  const t = useTranslations("errors");

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-16 md:px-6">
      <ErrorState>
        <h1 className="text-xl font-semibold">{t("somethingWentWrong")}</h1>
        <p className="mt-2 text-sm text-rose-900/80">{t("actionFailedRetry")}</p>
        <Button className="mt-4" onClick={reset}>
          {t("retry")}
        </Button>
      </ErrorState>
    </main>
  );
}
