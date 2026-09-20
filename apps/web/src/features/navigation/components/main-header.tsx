"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Bell, Menu, Search, ShoppingCart, User, X } from "@nova/icons";
import { Button, Input } from "@nova/ui";

import { useCartQuery } from "@/features/cart/cart.queries";
import { useNotificationsQuery } from "@/features/notifications/notifications.queries";
import { useAuth } from "@/providers/auth-provider";

// Icon-only navigation links on the dark header — 40px targets, matching Button size="icon".
const ICON_LINK =
  "flex h-10 w-10 items-center justify-center rounded-md text-white/80 hover:bg-white/10 hover:text-white";

export function MainHeader() {
  const t = useTranslations("navigation");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [searchValue, setSearchValue] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const notificationsQuery = useNotificationsQuery({ limit: 1 });
  const unreadCount = notificationsQuery.data?.unreadCount ?? 0;

  const cartQuery = useCartQuery();
  const cartCount = cartQuery.data?.lines.reduce((sum, l) => sum + l.quantity, 0) ?? 0;

  const navLinks = [
    { href: "/categories", label: t("categories") },
    { href: "/brands", label: t("brands") },
    { href: "/deals", label: t("deals") },
    { href: "/flash-sales", label: "Flash Sales" },
  ];

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = searchValue.trim();
    router.push(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search");
    setMobileOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 bg-[color:var(--color-surface-nav)] shadow-md">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-[color:var(--color-surface)] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[color:var(--color-primary)] focus:shadow"
      >
        {t("skipToContent")}
      </a>

      {/* Main bar */}
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-4 px-4 md:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-white"
          aria-label={tCommon("appName")}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[color:var(--color-accent)] text-sm font-bold text-white">
            N
          </span>
          <span className="hidden text-lg font-bold tracking-tight sm:block">
            {tCommon("appName")}
          </span>
        </Link>

        {/* Search — desktop */}
        <form onSubmit={handleSearchSubmit} className="hidden flex-1 md:block">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--color-foreground-subtle)]"
              size={16}
              aria-hidden="true"
            />
            <Input
              aria-label={t("searchAriaLabel")}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={t("searchPlaceholder")}
              type="search"
              value={searchValue}
              className="h-9 w-full rounded-lg border-0 bg-white/10 pl-9 text-sm text-white placeholder:text-white/50 focus:bg-[color:var(--color-surface)] focus:text-[color:var(--color-foreground)] focus:placeholder:text-[color:var(--color-foreground-subtle)]"
            />
          </div>
        </form>

        {/* Actions */}
        <div className="ml-auto flex items-center gap-1">
          {/* Mobile search toggle */}
          <Button
            aria-expanded={mobileOpen}
            aria-label="Toggle search"
            className="text-white/80 hover:bg-white/10 hover:text-white md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            size="icon"
            variant="ghost"
          >
            <Search aria-hidden="true" size={18} />
          </Button>

          {isAuthenticated ? (
            <Link
              href="/notifications"
              aria-label={t("notifications")}
              className={`relative ${ICON_LINK}`}
            >
              <Bell size={18} aria-hidden="true" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[color:var(--color-accent)] px-1 text-xs font-bold text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>
          ) : null}

          {isAuthenticated ? (
            <Link href="/account" aria-label={t("account")} className={ICON_LINK}>
              <User size={18} aria-hidden="true" />
            </Link>
          ) : (
            <Link href="/auth/login">
              <Button size="sm" variant="secondary" className="hidden sm:flex">
                Sign in
              </Button>
            </Link>
          )}

          <Link href="/cart" aria-label={t("cart")} className={`relative ${ICON_LINK}`}>
            <ShoppingCart size={18} aria-hidden="true" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[color:var(--color-accent)] px-1 text-xs font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Mobile menu toggle */}
          <Button
            aria-expanded={mobileOpen}
            aria-label="Toggle menu"
            className="text-white/80 hover:bg-white/10 hover:text-white md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            size="icon"
            variant="ghost"
          >
            {mobileOpen ? (
              <X aria-hidden="true" size={18} />
            ) : (
              <Menu aria-hidden="true" size={18} />
            )}
          </Button>
        </div>
      </div>

      {/* Nav links — desktop */}
      <nav className="hidden border-t border-white/10 md:block">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-1 px-4 md:px-6 lg:px-8">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-2.5 text-sm font-medium text-white/75 transition-colors hover:text-white"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/seller-store"
            className="ml-auto px-3 py-2.5 text-sm font-medium text-[color:var(--color-accent)] transition-colors hover:text-[color:var(--color-accent-hover)]"
          >
            {t("sellerStore")}
          </Link>
        </div>
      </nav>

      {/* Mobile panel */}
      {mobileOpen && (
        <div className="border-t border-white/10 bg-[color:var(--color-surface-nav)] px-4 pb-4 pt-3 md:hidden">
          <form onSubmit={handleSearchSubmit} className="mb-3">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--color-foreground-subtle)]"
                size={16}
                aria-hidden="true"
              />
              <Input
                aria-label={t("searchAriaLabel")}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={t("searchPlaceholder")}
                type="search"
                value={searchValue}
                className="h-9 w-full rounded-lg border-0 bg-white/10 pl-9 text-sm text-white placeholder:text-white/50"
              />
            </div>
          </form>
          <nav className="flex flex-col gap-1">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
