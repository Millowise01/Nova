import Link from "next/link";
import { useTranslations } from "next-intl";

import { Button, EmptyState } from "@nova/ui";

export default function ForbiddenPage() {
  const t = useTranslations("errors");

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-16 md:px-6">
      <EmptyState title={t("forbidden")} description={t("forbiddenDesc")}>
        <Link href="/">
          <Button>{t("goHome")}</Button>
        </Link>
      </EmptyState>
    </main>
  );
}
