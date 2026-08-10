"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import type { PropsWithChildren } from "react";

import { Bell, Heart, HelpCircle, Package, Settings, User, Wallet } from "@nova/icons";
import { Badge, Sidebar, SidebarBody, SidebarHeader, SidebarItem } from "@nova/ui";

import { ROUTES } from "@/config/routes";
import { useNotificationsQuery } from "@/features/notifications/notifications.queries";

export function DashboardLayout({ children }: PropsWithChildren) {
  const t = useTranslations("dashboard");
  const pathname = usePathname();
  // Strip the /[locale] segment (pathname is e.g. "/en/orders/abc123") so nav
  // items can match on the route itself, including sub-routes like order detail.
  const pathWithoutLocale = "/" + pathname.split("/").slice(2).join("/");

  // Cheap read — see notifications.queries.ts's comment: unreadCount reflects the
  // TOTAL unread count regardless of page size, so a 1-row page is enough here too.
  const notificationsQuery = useNotificationsQuery({ limit: 1 });
  const unreadCount = notificationsQuery.data?.unreadCount ?? 0;

  const navItems = [
    { href: ROUTES.account, label: t("navAccount"), icon: <User size={18} /> },
    { href: ROUTES.orders, label: t("navOrders"), icon: <Package size={18} /> },
    { href: ROUTES.wallet, label: t("navWallet"), icon: <Wallet size={18} /> },
    { href: ROUTES.wishlist, label: t("navWishlist"), icon: <Heart size={18} /> },
    {
      href: ROUTES.notifications,
      label: t("navNotifications"),
      icon: <Bell size={18} />,
      badge:
        unreadCount > 0 ? (
          <Badge size="sm" tone="error" variant="solid">
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        ) : undefined,
    },
    { href: ROUTES.settings, label: t("navSettings"), icon: <Settings size={18} /> },
    { href: ROUTES.support, label: t("navSupport"), icon: <HelpCircle size={18} /> },
  ];

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 md:grid-cols-[18rem_minmax(0,1fr)] md:px-6 lg:px-8">
      <Sidebar className="rounded-2xl border border-[color:var(--ds-border)] bg-[color:var(--ds-surface)]">
        <SidebarHeader>
          <p className="text-sm font-semibold">{t("title")}</p>
        </SidebarHeader>
        <SidebarBody>
          <ul className="space-y-1">
            {navItems.map((item) => (
              <SidebarItem
                active={
                  pathWithoutLocale === item.href || pathWithoutLocale.startsWith(`${item.href}/`)
                }
                badge={item.badge}
                href={item.href}
                icon={item.icon}
                key={item.href}
              >
                {item.label}
              </SidebarItem>
            ))}
          </ul>
        </SidebarBody>
      </Sidebar>
      <section>{children}</section>
    </div>
  );
}
