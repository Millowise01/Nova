"use client";

import { Badge, Button, Card, ErrorState, Spinner } from "@nova/ui";
import { formatMoney } from "@nova/utils";

import { useCancelOrderMutation } from "@/features/orders/orders.mutations";
import { useOrderQuery } from "@/features/orders/orders.queries";

// Mirrors backend/src/modules/orders/domain/order-state-machine.ts's canCancel —
// cancellation is only legal before an order has shipped. The backend is the
// real authority (400 ORDER_NOT_CANCELLABLE otherwise); this just avoids
// showing an action that would predictably fail.
const CANCELLABLE_STATUSES = ["placed", "confirmed", "packed"];

export function OrderDetailScreen({ orderId }: { orderId: string }) {
  const query = useOrderQuery(orderId);
  const cancelOrder = useCancelOrderMutation();

  if (query.isLoading) {
    return (
      <div className="flex items-center justify-center gap-3 py-24 text-sm text-[color:var(--color-foreground-muted)]">
        <Spinner className="h-4 w-4" /> Loading order...
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <ErrorState
        action={<Button onClick={() => void query.refetch()}>Try again</Button>}
        description="We couldn't load this order."
        title="Order not found"
      />
    );
  }

  const order = query.data;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-8 md:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[color:var(--color-foreground)]">
            Order #{order.id.slice(0, 8)}
          </h1>
          <p className="mt-1 text-sm text-[color:var(--color-foreground-muted)]">
            Placed {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <Badge tone={order.status === "cancelled" ? "error" : "success"}>{order.status}</Badge>
      </div>

      <Card className="space-y-3 rounded-xl p-5">
        <h2 className="text-base font-bold text-[color:var(--color-foreground)]">Sub-orders</h2>
        {order.subOrders.map((subOrder) => (
          <div className="flex items-center justify-between text-sm" key={subOrder.id}>
            <span className="text-[color:var(--color-foreground-muted)]">
              Seller {subOrder.sellerId.slice(0, 8)} — {subOrder.status}
            </span>
            <span className="font-bold text-[color:var(--color-foreground)]">
              {formatMoney({
                amount: subOrder.subtotalAmount,
                currency: subOrder.subtotalCurrency,
              })}
            </span>
          </div>
        ))}
      </Card>

      <Card className="flex items-center justify-between rounded-xl p-5">
        <p className="text-base font-bold text-[color:var(--color-foreground)]">Total</p>
        <p className="text-lg font-bold text-[color:var(--color-foreground)]">
          {formatMoney({ amount: order.totalAmount, currency: order.totalCurrency })}
        </p>
      </Card>

      {CANCELLABLE_STATUSES.includes(order.status) && (
        <Button
          disabled={cancelOrder.isPending}
          onClick={() => cancelOrder.mutate({ orderId: order.id })}
          variant="outline"
        >
          {cancelOrder.isPending ? "Cancelling..." : "Cancel Order"}
        </Button>
      )}
    </div>
  );
}
