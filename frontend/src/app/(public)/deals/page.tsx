import type { Metadata } from "next";
import { Tag, Zap } from "lucide-react";
import { ProductCard } from "@/components/commerce/ProductCard";
import { Badge } from "@/components/ui/Badge";
import { SEED_PRODUCTS } from "@/lib/seed-data";
import { formatSll } from "@/lib/format";

export const metadata: Metadata = { title: "Deals & Promotions" };

export default function DealsPage() {
  const deals = SEED_PRODUCTS.slice(0, 6);

  return (
    <div className="space-y-10">
      {/* Banner */}
      <div className="surface-gradient rounded-3xl px-8 py-10">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/20">
            <Zap size={24} className="text-secondary" />
          </div>
          <div>
            <Badge variant="warning" className="mb-1">Limited Time</Badge>
            <h1 className="text-3xl font-bold">Deals & Promotions</h1>
          </div>
        </div>
        <p className="mt-3 max-w-xl text-slate-600 dark:text-slate-300">
          Save on sustainable products from verified sellers. New deals added weekly.
        </p>
      </div>

      {/* Flash deals */}
      <section>
        <div className="mb-5 flex items-center gap-2">
          <Tag size={18} className="text-primary" />
          <h2 className="text-xl font-bold">Flash Deals</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {deals.map((p) => (
            <div key={p.id} className="relative">
              <div className="absolute -right-2 -top-2 z-10 rounded-full bg-error px-2 py-0.5 text-xs font-bold text-white">
                -20%
              </div>
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </section>

      {/* Coupon banner */}
      <div className="flex items-center justify-between rounded-2xl border border-secondary/30 bg-secondary/5 p-6">
        <div>
          <p className="font-bold text-slate-900 dark:text-slate-100">First order discount</p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Use code <strong>NOVA10</strong> for 10% off your first order</p>
        </div>
        <button className="rounded-xl border-2 border-dashed border-secondary px-4 py-2 text-sm font-bold text-secondary hover:bg-secondary/10">
          NOVA10
        </button>
      </div>
    </div>
  );
}
