"use client";

import { useTranslations } from "next-intl";

import { Button, ErrorState } from "@nova/ui";

export default function ServerErrorPage() {
  const t = useTranslations("errors");

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-16 md:px-6">
      <ErrorState>
        <h1 className="text-xl font-semibold">{t("somethingWentWrong")}</h1>
        <p className="mt-2 text-sm text-rose-900/80">{t("actionFailedRetry")}</p>
        <Button className="mt-4" onClick={handleRetry}>
          {t("retry")}
        </Button>
      </ErrorState>
    </main>
  );
}
