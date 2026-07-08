import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button, EmptyState } from "@nova/ui";

export default function NotFound() {
  const t = useTranslations("errors");

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-16 md:px-6">
      <EmptyState>
        <h1 className="text-xl font-semibold">{t("pageNotFound")}</h1>
        <p className="mt-2 text-sm text-[color:var(--ds-muted-text)]">{t("pageNotFoundDesc")}</p>
        <Link href="/">
          <Button className="mt-4">{t("goHome")}</Button>
        </Link>
      </EmptyState>
    </main>
  );
}
