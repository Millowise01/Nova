import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/dashboard/DataTable";
import { Badge } from "@/components/ui/Badge";
import { SEED_PRODUCTS } from "@/lib/seed-data";
import { formatSll } from "@/lib/format";

export const metadata: Metadata = { title: "Product Management" };

export default function SellerProductsPage() {
  const rows = SEED_PRODUCTS.slice(0, 6).map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category.name,
    price: formatSll(p.priceSll),
    stock: p.stock,
    ecoScore: p.ecoScore,
    status: p.isActive ? "active" : "inactive",
  }));

  return (
    <main className="space-y-6 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Product Management</h1>
        <button className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90">
          <Plus size={15} /> Add Product
        </button>
      </div>

      <DataTable
        columns={[
          { key: "name", header: "Product", sortable: true },
          { key: "category", header: "Category", sortable: true },
          { key: "price", header: "Price", sortable: true },
          { key: "stock", header: "Stock", sortable: true, render: (row) => (
            <span className={Number(row.stock) < 10 ? "font-semibold text-warning" : ""}>{String(row.stock)}</span>
          )},
          { key: "ecoScore", header: "Eco", render: (row) => (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">{String(row.ecoScore)}</span>
          )},
          { key: "status", header: "Status", render: (row) => (
            <Badge variant={row.status === "active" ? "success" : "default"}>
              {String(row.status)}
            </Badge>
          )},
          { key: "id", header: "Actions", render: () => (
            <div className="flex gap-2">
              <button className="rounded-lg border border-slate-200 px-2 py-1 text-xs hover:border-primary hover:text-primary dark:border-slate-700">Edit</button>
              <button className="rounded-lg border border-red-200 px-2 py-1 text-xs text-error hover:bg-red-50">Delete</button>
            </div>
          )},
        ]}
        data={rows as Record<string, unknown>[]}
      />
    </main>
  );
}
