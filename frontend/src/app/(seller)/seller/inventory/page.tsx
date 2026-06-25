import type { Metadata } from "next";
import { AlertTriangle } from "lucide-react";
import { DataTable } from "@/components/dashboard/DataTable";
import { SEED_PRODUCTS } from "@/lib/seed-data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Inventory Management" };

export default function SellerInventoryPage() {
  const rows = SEED_PRODUCTS.map((p) => ({
    id: p.id,
    name: p.name,
    sku: `SKU-${p.id.toUpperCase()}`,
    category: p.category.name,
    stock: p.stock,
    alert: p.stock < 10,
  }));

  const lowStock = rows.filter((r) => r.alert);

  return (
    <main className="space-y-6 py-6">
      <h1 className="text-2xl font-bold">Inventory Management</h1>

      {lowStock.length > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-warning/30 bg-warning/10 p-4">
          <AlertTriangle size={18} className="mt-0.5 flex-shrink-0 text-warning" />
          <div>
            <p className="font-semibold text-warning">Low Stock Alert</p>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              {lowStock.length} product{lowStock.length !== 1 ? "s have" : " has"} fewer than 10 units remaining.
            </p>
          </div>
        </div>
      )}

      <DataTable
        columns={[
          { key: "name", header: "Product", sortable: true },
          { key: "sku", header: "SKU" },
          { key: "category", header: "Category", sortable: true },
          {
            key: "stock",
            header: "Stock",
            sortable: true,
            render: (row) => (
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "font-semibold",
                    Number(row.stock) === 0 && "text-error",
                    Number(row.stock) > 0 && Number(row.stock) < 10 && "text-warning",
                    Number(row.stock) >= 10 && "text-success",
                  )}
                >
                  {String(row.stock)}
                </span>
                {Number(row.stock) < 10 && <AlertTriangle size={13} className="text-warning" />}
              </div>
            ),
          },
          {
            key: "id",
            header: "Actions",
            render: () => (
              <button className="rounded-lg border border-slate-200 px-2 py-1 text-xs hover:border-primary hover:text-primary dark:border-slate-700">
                Update Stock
              </button>
            ),
          },
        ]}
        data={rows as Record<string, unknown>[]}
      />
    </main>
  );
}
