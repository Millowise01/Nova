import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button, EmptyState } from "@nova/ui";

export default function ForbiddenPage() {
  const t = useTranslations("errors");
  const tc = useTranslations("common");

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-16 md:px-6">
      <EmptyState>
        <h1 className="text-xl font-semibold">{t("forbidden")}</h1>
        <p className="mt-2 text-sm text-slate-600">{t("forbiddenDesc")}</p>
        <Link href="/">
          <Button className="mt-4">{tc("goHome")}</Button>
        </Link>
      </EmptyState>
    </main>
  );
}
