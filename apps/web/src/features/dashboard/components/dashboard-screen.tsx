"use client";

import Link from "next/link";

import { Bell, ChevronRight, Heart, HelpCircle, Package, Settings, Wallet } from "@nova/icons";
import { Card, Spinner } from "@nova/ui";

import { ROUTES } from "@/config/routes";
import { useMeQuery } from "@/features/account/account.queries";
import { useNotificationsQuery } from "@/features/notifications/notifications.queries";
import { useOrdersListQuery } from "@/features/orders/orders.queries";
import { useWalletBalanceQuery } from "@/features/wallet/wallet.queries";
import { useWishlistQuery } from "@/features/wishlist/wishlist.queries";

function SummaryCard({
  href,
  icon,
  label,
  value,
  loading,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  value: string;
  loading: boolean;
}) {
  return (
    <Link href={href} className="group block">
      <Card className="flex items-center justify-between gap-3 rounded-xl p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex items-center gap-3">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--color-primary-subtle)] text-[color:var(--color-primary)]"
            aria-hidden="true"
          >
            {icon}
          </span>
          <div>
            <p className="text-xs font-semibold text-[color:var(--color-foreground-subtle)]">
              {label}
            </p>
            {loading ? (
              <Spinner className="mt-1 h-4 w-4" />
            ) : (
              <p className="text-lg font-bold text-[color:var(--color-foreground)]">{value}</p>
            )}
          </div>
        </div>
        <ChevronRight
          aria-hidden="true"
          className="text-[color:var(--color-foreground-muted)]"
          size={18}
        />
      </Card>
    </Link>
  );
}

/** The real account hub — GET /me for the greeting, plus one cheap live read
 *  from each real feature (orders, wallet, wishlist, notifications) so this page
 *  is genuinely useful to land on, not just a set of links. Rendered at /account
 *  (see app/[locale]/(dashboard)/account/page.tsx). */
export function DashboardScreen() {
  const meQuery = useMeQuery();
  const ordersQuery = useOrdersListQuery();
  const walletQuery = useWalletBalanceQuery();
  const wishlistQuery = useWishlistQuery();
  const notificationsQuery = useNotificationsQuery({ limit: 1 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[color:var(--color-foreground)]">
          {meQuery.data?.name ? `Welcome back, ${meQuery.data.name}` : "Welcome back"}
        </h1>
        <p className="mt-1 text-sm text-[color:var(--color-foreground-muted)]">
          Here&apos;s a snapshot of your account.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SummaryCard
          href={ROUTES.orders}
          icon={<Package size={22} />}
          label="Orders"
          loading={ordersQuery.isLoading}
          value={
            ordersQuery.data
              ? `${ordersQuery.data.length} order${ordersQuery.data.length === 1 ? "" : "s"}`
              : "—"
          }
        />
        <SummaryCard
          href={ROUTES.wallet}
          icon={<Wallet size={22} />}
          label="Wallet balance"
          loading={walletQuery.isLoading}
          value={walletQuery.data ? `${walletQuery.data.currency} ${walletQuery.data.amount}` : "—"}
        />
        <SummaryCard
          href={ROUTES.wishlist}
          icon={<Heart size={22} />}
          label="Wishlist"
          loading={wishlistQuery.isLoading}
          value={
            wishlistQuery.data
              ? `${wishlistQuery.data.items.length} saved item${wishlistQuery.data.items.length === 1 ? "" : "s"}`
              : "—"
          }
        />
        <SummaryCard
          href={ROUTES.notifications}
          icon={<Bell size={22} />}
          label="Notifications"
          loading={notificationsQuery.isLoading}
          value={
            notificationsQuery.data
              ? notificationsQuery.data.unreadCount > 0
                ? `${notificationsQuery.data.unreadCount} unread`
                : "All caught up"
              : "—"
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link href={ROUTES.settings} className="block">
          <Card className="flex items-center gap-3 rounded-xl p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <Settings
              aria-hidden="true"
              className="text-[color:var(--color-foreground-muted)]"
              size={20}
            />
            <span className="font-medium text-[color:var(--color-foreground)]">
              Account settings
            </span>
          </Card>
        </Link>
        <Link href={ROUTES.support} className="block">
          <Card className="flex items-center gap-3 rounded-xl p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <HelpCircle
              aria-hidden="true"
              className="text-[color:var(--color-foreground-muted)]"
              size={20}
            />
            <span className="font-medium text-[color:var(--color-foreground)]">
              Help &amp; support
            </span>
          </Card>
        </Link>
      </div>
    </div>
  );
}
