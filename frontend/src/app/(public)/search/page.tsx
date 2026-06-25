import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchBar } from "@/components/commerce/SearchBar";
import { ProductCard } from "@/components/commerce/ProductCard";
import { EmptyState, LoadingState } from "@/components/ui/PageState";
import { SEED_PRODUCTS } from "@/lib/seed-data";

export const metadata: Metadata = { title: "Search Results" };

interface Props { searchParams: Promise<{ q?: string; sort?: string }> }

export default async function SearchPage({ searchParams }: Props) {
  const { q = "", sort = "" } = await searchParams;

  let results = q.trim()
    ? SEED_PRODUCTS.filter((p) =>
        p.name.toLowerCase().includes(q.toLowerCase()) ||
        p.category.name.toLowerCase().includes(q.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(q.toLowerCase())),
      )
    : SEED_PRODUCTS;

  if (sort === "price_asc") results = [...results].sort((a, b) => a.priceSll - b.priceSll);
  else if (sort === "price_desc") results = [...results].sort((a, b) => b.priceSll - a.priceSll);
  else if (sort === "rating_desc") results = [...results].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-4 text-2xl font-bold">
          {q ? `Results for "${q}"` : "All Products"}
        </h1>
        <Suspense fallback={<LoadingState />}>
          <SearchBar />
        </Suspense>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{results.length} product{results.length !== 1 ? "s" : ""} found</p>
        <form>
          <select name="sort" defaultValue={sort} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            onChange={(e) => { const u = new URL(window.location.href); u.searchParams.set("sort", e.target.value); window.location.href = u.toString(); }}>
            <option value="">Most Relevant</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating_desc">Top Rated</option>
          </select>
        </form>
      </div>

      {results.length === 0 ? (
        <EmptyState title="No results found" message={`No products match "${q}". Try a different search term.`} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {results.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
