"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { SEED_CATEGORIES } from "@/lib/seed-data";
import { cn } from "@/lib/utils";

export function FilterSidebar({ className }: { className?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [maxPrice, setMaxPrice] = useState(2_000_000);
  const [minEco, setMinEco] = useState(0);
  const selectedCategory = searchParams.get("category") ?? "";
  const selectedSort = searchParams.get("sort") ?? "";

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/catalog?${params.toString()}`);
  }

  return (
    <aside className={cn("space-y-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900", className)}>
      <div className="flex items-center gap-2 font-semibold">
        <SlidersHorizontal size={16} className="text-primary" />
        Filters
      </div>

      {/* Category */}
      <div>
        <p className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-300">Category</p>
        <div className="space-y-2">
          <button
            onClick={() => updateParam("category", "")}
            className={cn("block w-full rounded-lg px-3 py-2 text-left text-sm transition", selectedCategory === "" ? "bg-primary/10 font-semibold text-primary" : "hover:bg-slate-100 dark:hover:bg-slate-800")}
          >
            All Categories
          </button>
          {SEED_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateParam("category", cat.slug)}
              className={cn("flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition", selectedCategory === cat.slug ? "bg-primary/10 font-semibold text-primary" : "hover:bg-slate-100 dark:hover:bg-slate-800")}
            >
              {cat.name}
              <span className="text-xs text-slate-400">{cat.productCount}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <p className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-300">Max Price</p>
        <input
          type="range"
          min={50_000}
          max={2_000_000}
          step={50_000}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          onMouseUp={() => updateParam("maxPrice", String(maxPrice))}
          className="w-full accent-primary"
          aria-label="Max price"
        />
        <p className="mt-1 text-xs text-slate-500">Up to SLL {(maxPrice / 1000).toFixed(0)}K</p>
      </div>

      {/* Eco score */}
      <div>
        <p className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-300">Min Eco Score</p>
        <div className="flex gap-2">
          {[0, 70, 80, 90].map((score) => (
            <button
              key={score}
              onClick={() => { setMinEco(score); updateParam("ecoMin", score > 0 ? String(score) : ""); }}
              className={cn("flex-1 rounded-lg border py-1.5 text-xs font-medium transition", minEco === score ? "border-primary bg-primary/10 text-primary" : "border-slate-200 hover:border-primary dark:border-slate-700")}
            >
              {score === 0 ? "Any" : `${score}+`}
            </button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div>
        <p className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-300">Sort By</p>
        <select
          value={selectedSort}
          onChange={(e) => updateParam("sort", e.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-900"
          aria-label="Sort products"
        >
          <option value="">Relevance</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="eco_desc">Eco Score</option>
          <option value="rating_desc">Top Rated</option>
          <option value="newest">Newest</option>
        </select>
      </div>

      {/* Eco only toggle */}
      <label className="flex cursor-pointer items-center justify-between">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Eco certified only</span>
        <div className="relative">
          <input
            type="checkbox"
            checked={searchParams.get("eco") === "true"}
            onChange={(e) => updateParam("eco", e.target.checked ? "true" : "")}
            className="sr-only"
          />
          <div className={cn("h-5 w-9 rounded-full transition", searchParams.get("eco") === "true" ? "bg-primary" : "bg-slate-300 dark:bg-slate-700")}>
            <div className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform", searchParams.get("eco") === "true" ? "translate-x-4" : "translate-x-0.5")} />
          </div>
        </div>
      </label>
    </aside>
  );
}
