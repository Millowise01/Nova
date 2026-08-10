"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Bell } from "@nova/icons";
import { Badge, Button, Input } from "@nova/ui";

import { useNotificationsQuery } from "@/features/notifications/notifications.queries";
import { useAuth } from "@/providers/auth-provider";

export function MainHeader() {
  const t = useTranslations("navigation");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [searchValue, setSearchValue] = useState("");

  // Cheap read — the response's unreadCount reflects the user's TOTAL unread count
  // regardless of page size, so a 1-row page is enough for the badge (see
  // notifications.queries.ts's comment). Same React Query cache the notifications
  // page itself reads from, keyed separately since the params differ.
  const notificationsQuery = useNotificationsQuery({ limit: 1 });
  const unreadCount = notificationsQuery.data?.unreadCount ?? 0;

  const topLinks = [
    { href: "/categories", label: t("categories") },
    { href: "/brands", label: t("brands") },
    { href: "/deals", label: t("deals") },
    { href: "/seller-store", label: t("sellerStore") },
  ];

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = searchValue.trim();
    router.push(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--ds-border)] bg-white/95 backdrop-blur">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[color:var(--ds-primary)] focus:shadow"
      >
        {t("skipToContent")}
      </a>
      <div className="mx-auto grid w-full max-w-7xl gap-3 px-4 py-3 md:grid-cols-[12rem_minmax(0,1fr)_auto] md:items-center md:px-6 lg:px-8">
        <Link className="text-xl font-semibold text-[color:var(--ds-text)]" href="/">
          {tCommon("appName")}
        </Link>
        <form onSubmit={handleSearchSubmit}>
          <Input
            aria-label={t("searchAriaLabel")}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={t("searchPlaceholder")}
            type="search"
            value={searchValue}
          />
        </form>
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <Link
              aria-label={t("notifications")}
              className="relative inline-flex"
              href="/notifications"
            >
              <Button size="sm" variant="ghost">
                <Bell aria-hidden="true" size={20} />
              </Button>
              {unreadCount > 0 ? (
                <Badge
                  className="absolute -right-1 -top-1 min-w-[1.25rem] justify-center px-1"
                  size="sm"
                  tone="error"
                  variant="solid"
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Badge>
              ) : null}
            </Link>
          ) : null}
          <Button size="sm" variant="ghost">
            {t("account")}
          </Button>
          <Button size="sm">{t("cart")}</Button>
        </div>
      </div>
      <nav className="mx-auto hidden w-full max-w-7xl items-center gap-6 px-4 pb-3 text-sm md:flex md:px-6 lg:px-8">
        {topLinks.map((item) => (
          <Link
            className="font-medium text-slate-700 hover:text-[color:var(--ds-primary)]"
            href={item.href}
            key={item.href}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
