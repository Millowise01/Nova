"use client";

import { useState } from "react";
import { DataTable } from "@/components/dashboard/DataTable";
import { Badge } from "@/components/ui/Badge";
import { formatSll, formatDate } from "@/lib/format";
import type { OrderStatus } from "@/types/domain";

const ORDERS = [
  { id: "ord-101", customer: "Aminata K.", total: 320_000, status: "PLACED", date: "2025-06-05T09:00:00Z" },
  { id: "ord-102", customer: "Mohamed S.", total: 510_000, status: "PACKED", date: "2025-06-04T14:00:00Z" },
  { id: "ord-103", customer: "Fatmata J.", total: 195_000, status: "DELIVERED", date: "2025-06-01T11:00:00Z" },
  { id: "ord-104", customer: "Ibrahim B.", total: 285_000, status: "OUT_FOR_DELIVERY", date: "2025-06-03T08:00:00Z" },
  { id: "ord-105", customer: "Hawa C.", total: 150_000, status: "CANCELLED", date: "2025-05-30T16:00:00Z" },
];

const STATUS_TABS: (OrderStatus | "ALL")[] = ["ALL", "PLACED", "PACKED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];
const variantMap: Record<string, "success" | "warning" | "error" | "default"> = {
  DELIVERED: "success", PLACED: "default", CONFIRMED: "default",
  PACKED: "warning", OUT_FOR_DELIVERY: "warning", CANCELLED: "error",
};

export default function SellerOrdersPage() {
  const [filter, setFilter] = useState<"ALL" | OrderStatus>("ALL");

  const filtered = filter === "ALL" ? ORDERS : ORDERS.filter((o) => o.status === filter);

  return (
    <main className="space-y-6 py-6">
      <h1 className="text-2xl font-bold">Orders Management</h1>

      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
              filter === tab
                ? "bg-primary text-white"
                : "border border-slate-200 hover:border-primary dark:border-slate-700"
            }`}
          >
            {tab.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      <DataTable
        columns={[
          { key: "id", header: "Order ID", sortable: true },
          { key: "customer", header: "Customer", sortable: true },
          { key: "date", header: "Date", render: (row) => formatDate(String(row.date)) },
          { key: "total", header: "Total", sortable: true, render: (row) => formatSll(Number(row.total)) },
          { key: "status", header: "Status", render: (row) => (
            <Badge variant={variantMap[String(row.status)] ?? "default"}>
              {String(row.status).replace(/_/g, " ")}
            </Badge>
          )},
          { key: "id", header: "Actions", render: (row) => (
            <button className="rounded-lg border border-slate-200 px-2 py-1 text-xs hover:border-primary hover:text-primary dark:border-slate-700">
              View
            </button>
          )},
        ]}
        data={filtered as Record<string, unknown>[]}
        emptyMessage="No orders match this filter"
      />
    </main>
  );
}
