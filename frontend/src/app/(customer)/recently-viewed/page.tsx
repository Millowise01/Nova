"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Clock } from "lucide-react";
import { ProductCard } from "@/components/commerce/ProductCard";
import { SEED_PRODUCTS } from "@/lib/seed-data";

// In production this would read from a persisted store / API
function useRecentlyViewed() {
  return useMemo(() => SEED_PRODUCTS.slice(0, 6), []);
}

export default function RecentlyViewedPage() {
  const products = useRecentlyViewed();

  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-2xl font-bold">Recently Viewed</h1>
        <p className="mt-1 text-sm text-slate-500">
          Products you&apos;ve browsed — quickly pick up where you left off.
        </p>
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-700">
          <Clock size={36} className="mx-auto mb-3 text-slate-300" />
          <p className="font-medium">No recently viewed products</p>
          <p className="mt-1 text-sm text-slate-500">Start browsing to see your history here</p>
          <Link
            href="/catalog"
            className="mt-5 inline-flex rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary/90"
          >
            Browse Catalog
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
