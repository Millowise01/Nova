import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { OrderTimeline } from "@/components/commerce/OrderTimeline";
import { formatSll, formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import type { OrderStatus } from "@/types/domain";

export const metadata: Metadata = { title: "Order Tracking" };

const DEMO_ORDER = {
  id: "ord-002",
  status: "OUT_FOR_DELIVERY" as OrderStatus,
  placedAt: "2025-06-01T11:30:00Z",
  totalSll: 285_000,
  deliveryAddress: "12 Wilkinson Road, Freetown",
  items: [
    { name: "Organic Cocoa Butter", quantity: 1, priceSll: 240_000, image: "https://images.unsplash.com/photo-1615486363973-f79cccbf9f5f?auto=format&fit=crop&w=200&q=80" },
  ],
};

const statusVariant: Record<string, "success" | "warning" | "error" | "default"> = {
  DELIVERED: "success",
  PLACED: "default",
  CONFIRMED: "default",
  PACKED: "warning",
  OUT_FOR_DELIVERY: "warning",
  CANCELLED: "error",
};

export default function OrdersPage() {
  return (
    <div className="space-y-6 py-6">
      <div>
        <Link
          href="/account/order-history"
          className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-primary"
        >
          <ArrowLeft size={14} /> Back to Orders
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold">Order #{DEMO_ORDER.id}</h1>
          <Badge variant={statusVariant[DEMO_ORDER.status] ?? "default"}>
            {DEMO_ORDER.status.replace(/_/g, " ")}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Placed {formatDate(DEMO_ORDER.placedAt)} · Total {formatSll(DEMO_ORDER.totalSll)}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <OrderTimeline status={DEMO_ORDER.status} />

        <aside className="space-y-4">
          {/* Items */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-4 font-semibold">Items</h3>
            <div className="space-y-3">
              {DEMO_ORDER.items.map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-14 w-14 flex-shrink-0 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold">{formatSll(item.priceSll)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery address */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-2 font-semibold">Delivery Address</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">{DEMO_ORDER.deliveryAddress}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
