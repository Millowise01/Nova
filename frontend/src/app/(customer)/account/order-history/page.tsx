import type { Metadata } from "next";
import Link from "next/link";
import { Package } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { formatSll, formatDate } from "@/lib/format";
import type { Order } from "@/types/domain";

export const metadata: Metadata = { title: "Order History" };

const statusVariant: Record<string, "success" | "warning" | "error" | "default"> = {
  DELIVERED: "success",
  PLACED: "default",
  CONFIRMED: "default",
  PACKED: "warning",
  OUT_FOR_DELIVERY: "warning",
  CANCELLED: "error",
};

const SEED_ORDERS: Order[] = [
  {
    id: "ord-001",
    status: "DELIVERED",
    subtotalSll: 640_000,
    deliveryFeeSll: 15_000,
    totalSll: 655_000,
    paymentMethod: "ORANGE_MONEY",
    paymentStatus: "PAID",
    placedAt: "2025-05-10T09:00:00Z",
    updatedAt: "2025-05-14T16:00:00Z",
    items: [
      { id: "oi-1", productId: "p-1", quantity: 2, unitPriceSll: 320_000 },
    ],
  },
  {
    id: "ord-002",
    status: "OUT_FOR_DELIVERY",
    subtotalSll: 240_000,
    deliveryFeeSll: 45_000,
    totalSll: 285_000,
    paymentMethod: "CARD",
    paymentStatus: "PAID",
    placedAt: "2025-06-01T11:30:00Z",
    updatedAt: "2025-06-03T08:00:00Z",
    items: [
      { id: "oi-2", productId: "p-2", quantity: 1, unitPriceSll: 240_000 },
    ],
  },
  {
    id: "ord-003",
    status: "CANCELLED",
    subtotalSll: 150_000,
    deliveryFeeSll: 15_000,
    totalSll: 165_000,
    paymentMethod: "AFRICELL_MONEY",
    paymentStatus: "REFUNDED",
    placedAt: "2025-04-20T14:00:00Z",
    updatedAt: "2025-04-21T10:00:00Z",
    items: [
      { id: "oi-3", productId: "p-3", quantity: 1, unitPriceSll: 150_000 },
    ],
  },
];

export default function OrderHistoryPage() {
  return (
    <div className="space-y-6 py-6">
      <h1 className="text-2xl font-bold">Order History</h1>

      {SEED_ORDERS.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-700">
          <Package size={36} className="mx-auto mb-3 text-slate-300" />
          <p className="font-medium">No orders yet</p>
          <p className="mt-1 text-sm text-slate-500">Your completed orders will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {SEED_ORDERS.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      #{order.id}
                    </p>
                    <Badge variant={statusVariant[order.status] ?? "default"}>
                      {order.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Placed {formatDate(order.placedAt)} · {order.items.length} item
                    {order.items.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900 dark:text-slate-100">
                    {formatSll(order.totalSll)}
                  </p>
                  <p className="text-xs text-slate-500">{order.paymentMethod.replace(/_/g, " ")}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={`/orders?id=${order.id}`}
                  className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium hover:border-primary hover:text-primary dark:border-slate-700"
                >
                  Track Order
                </Link>
                {order.status !== "CANCELLED" && (
                  <button className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium hover:border-error hover:text-error dark:border-slate-700">
                    Request Return
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
