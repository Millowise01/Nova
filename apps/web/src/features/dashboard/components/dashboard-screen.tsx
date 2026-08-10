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
    <Link href={href}>
      <Card className="flex items-center justify-between gap-3 transition-colors hover:bg-[color:var(--color-muted)]">
        <div className="flex items-center gap-3">
          <span className="text-[color:var(--color-foreground-muted)]" aria-hidden="true">
            {icon}
          </span>
          <div>
            <p className="text-sm text-[color:var(--color-foreground-muted)]">{label}</p>
            {loading ? (
              <Spinner className="mt-1 h-4 w-4" />
            ) : (
              <p className="text-lg font-semibold">{value}</p>
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
        <h1 className="text-2xl font-semibold">
          {meQuery.data?.name ? `Welcome back, ${meQuery.data.name}` : "Welcome back"}
        </h1>
        <p className="text-sm text-slate-600">Here's a snapshot of your account.</p>
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
        <Link href={ROUTES.settings}>
          <Card className="flex items-center gap-3 transition-colors hover:bg-[color:var(--color-muted)]">
            <Settings
              aria-hidden="true"
              className="text-[color:var(--color-foreground-muted)]"
              size={20}
            />
            <span className="font-medium">Account settings</span>
          </Card>
        </Link>
        <Link href={ROUTES.support}>
          <Card className="flex items-center gap-3 transition-colors hover:bg-[color:var(--color-muted)]">
            <HelpCircle
              aria-hidden="true"
              className="text-[color:var(--color-foreground-muted)]"
              size={20}
            />
            <span className="font-medium">Help &amp; support</span>
          </Card>
        </Link>
      </div>
    </div>
  );
}
