"use client";

import Link from "next/link";

import { Badge, Button, Card, EmptyState, ErrorState, Spinner } from "@nova/ui";
import { formatMoney } from "@nova/utils";

import { useOrdersListQuery } from "@/features/orders/orders.queries";

export function OrdersScreen() {
  const query = useOrdersListQuery();

  if (query.isLoading) {
    return (
      <div className="flex items-center justify-center gap-3 py-24 text-sm text-slate-600">
        <Spinner className="h-4 w-4" /> Loading your orders...
      </div>
    );
  }

  if (query.isError) {
    return (
      <ErrorState
        action={<Button onClick={() => void query.refetch()}>Try again</Button>}
        description="We couldn't load your order history."
        title="Something went wrong"
      />
    );
  }

  const orders = query.data ?? [];

  if (orders.length === 0) {
    return (
      <EmptyState
        action={
          <Link href="/catalog">
            <Button>Start shopping</Button>
          </Link>
        }
        description="Orders you place will show up here."
        title="No orders yet"
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-8 md:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold">Order History</h1>

      <div className="space-y-3">
        {orders.map((order) => (
          <Link href={`/orders/${order.id}`} key={order.id}>
            <Card className="flex items-center justify-between transition hover:shadow-md">
              <div>
                <p className="text-sm font-semibold">Order #{order.id.slice(0, 8)}</p>
                <p className="text-xs text-slate-500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm font-semibold">
                  {formatMoney({ amount: order.totalAmount, currency: order.totalCurrency })}
                </p>
                <Badge tone={order.status === "cancelled" ? "error" : "success"}>
                  {order.status}
                </Badge>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
