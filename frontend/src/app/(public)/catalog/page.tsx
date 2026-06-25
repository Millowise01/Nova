import type { Metadata } from "next";
import { Suspense } from "react";
import { FilterSidebar } from "@/components/commerce/FilterSidebar";
import { ProductCard } from "@/components/commerce/ProductCard";
import { LoadingState } from "@/components/ui/PageState";
import { SEED_PRODUCTS } from "@/lib/seed-data";

export const metadata: Metadata = { title: "Product Catalog" };

interface Props { searchParams: Promise<Record<string, string | undefined>> }

export default async function CatalogPage({ searchParams }: Props) {
  const params = await searchParams;
  const category = params.category ?? "";
  const eco = params.eco === "true";
  const sort = params.sort ?? "";
  const q = params.q ?? "";
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : Infinity;
  const ecoMin = params.ecoMin ? Number(params.ecoMin) : 0;

  let products = SEED_PRODUCTS.filter((p) => {
    if (category && p.category.slug !== category) return false;
    if (eco && !p.isEcoCertified) return false;
    if (q && !p.name.toLowerCase().includes(q.toLowerCase())) return false;
    if (p.priceSll > maxPrice) return false;
    if (p.ecoScore < ecoMin) return false;
    return true;
  });

  if (sort === "price_asc") products = [...products].sort((a, b) => a.priceSll - b.priceSll);
  else if (sort === "price_desc") products = [...products].sort((a, b) => b.priceSll - a.priceSll);
  else if (sort === "eco_desc") products = [...products].sort((a, b) => b.ecoScore - a.ecoScore);
  else if (sort === "rating_desc") products = [...products].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Product Catalog</h1>
        <p className="mt-1 text-sm text-slate-500">{products.length} products found</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <Suspense fallback={<LoadingState />}>
          <FilterSidebar />
        </Suspense>
        <div>
          {products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-700">
              <p className="font-medium">No products match your filters</p>
              <p className="mt-1 text-sm text-slate-500">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
