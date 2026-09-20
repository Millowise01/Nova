"use client";

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
        { href: "/new-arrivals", label: t("newArrivals") },
        { href: "/flash-sales", label: "Flash Sales" },
      ],
    },
    {
      title: t("account"),
      links: [
        { href: "/account", label: t("dashboard") },
        { href: "/orders", label: t("orders") },
        { href: "/wallet", label: t("wallet") },
        { href: "/wishlist", label: "Wishlist" },
      ],
    },
    {
      title: t("support"),
      links: [
        { href: "/support", label: t("helpCenter") },
        { href: "/support", label: t("faqs") },
        { href: "/support", label: t("contact") },
      ],
    },
  ];

  return (
    <footer className="bg-[color:var(--color-surface-footer)] text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 md:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Brand column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[color:var(--color-accent)] text-sm font-bold text-white">
                N
              </span>
              <span className="text-lg font-bold">Nova</span>
            </div>
            <p className="text-sm text-white/50">{t("tagline")}</p>
            <div className="flex gap-3">
              {["𝕏", "in", "f"].map((icon) => (
                <span
                  key={icon}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/10 text-xs text-white/50 transition-colors hover:border-white/30 hover:text-white"
                >
                  {icon}
                </span>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h4 className="mb-4 text-sm font-semibold text-white/40">{column.title}</h4>
              <ul className="space-y-2.5">
                {column.links.map((link) => (
                  <li key={`${link.href}-${link.label}`}>
                    <Link
                      className="text-sm text-white/60 transition-colors hover:text-white"
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

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} Nova. All rights reserved.
          </p>
          <div className="flex gap-4">
            {["Privacy Policy", "Terms of Service"].map((label) => (
              <Link key={label} href="#" className="text-xs text-white/30 hover:text-white/60">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
