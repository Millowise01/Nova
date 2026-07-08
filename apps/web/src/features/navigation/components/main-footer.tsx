import Link from "next/link";
import { useTranslations } from "next-intl";

export function MainFooter() {
  const t = useTranslations("footer");

  const footerColumns = [
    {
      title: t("shop"),
      links: [
        { href: "/categories", label: t("categories") },
        { href: "/deals", label: t("dailyDeals") },
        { href: "/new-arrivals", label: t("newArrivals") }
      ]
    },
    {
      title: t("account"),
      links: [
        { href: "/account", label: t("dashboard") },
        { href: "/orders", label: t("orders") },
        { href: "/wallet", label: t("wallet") }
      ]
    },
    {
      title: t("support"),
      links: [
        { href: "/support/help-center", label: t("helpCenter") },
        { href: "/support/faqs", label: t("faqs") },
        { href: "/support/contact", label: t("contact") }
      ]
    }
  ];

  return (
    <footer className="border-t border-[color:var(--ds-border)] bg-[color:var(--ds-surface)]">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-10 md:grid-cols-4 md:px-6 lg:px-8">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Nova</h3>
          <p className="text-sm text-slate-600">{t("tagline")}</p>
        </div>
        {footerColumns.map((column) => (
          <div key={column.title}>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-900">
              {column.title}
            </h4>
            <ul className="mt-3 space-y-2">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    className="text-sm text-slate-600 hover:text-[color:var(--ds-primary)]"
                    href={link.href}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}

