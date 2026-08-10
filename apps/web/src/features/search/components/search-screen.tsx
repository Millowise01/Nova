"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { EmptyState, ErrorState, Input, ProductCard, Spinner } from "@nova/ui";

import { ModuleShell } from "@/features/shared/components";

import { useSearchQuery } from "../search.queries";
import { useDebouncedValue } from "../use-debounced-value";

const DEBOUNCE_MS = 350;

export function SearchScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";

  const [inputValue, setInputValue] = useState(initialQuery);
  const debouncedQuery = useDebouncedValue(inputValue, DEBOUNCE_MS);

  // Keeps the URL shareable/bookmarkable (e.g. /search?q=wireless mouse) without
  // firing a request on every keystroke — the query itself is driven off
  // debouncedQuery, not the URL.
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (debouncedQuery.trim()) {
      params.set("q", debouncedQuery);
    } else {
      params.delete("q");
    }
    router.replace(`/search?${params.toString()}`, { scroll: false });
  }, [debouncedQuery]); // intentionally excludes router/searchParams — only the debounced value should retrigger this

  const query = useSearchQuery(debouncedQuery);

  return (
    <ModuleShell
      subtitle="Search products by name, description, category, brand, and price."
      title="Search"
    >
      <Input
        aria-label="Search products"
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Search products, sellers, categories"
        type="search"
        value={inputValue}
      />

      {!debouncedQuery.trim() ? null : query.isLoading ? (
        <div className="flex items-center gap-2 py-8 text-sm text-slate-600">
          <Spinner className="h-4 w-4" /> Searching...
        </div>
      ) : query.isError ? (
        <ErrorState description="We couldn't run that search." title="Something went wrong" />
      ) : query.data && query.data.data.length === 0 ? (
        <EmptyState description={`No products matched "${debouncedQuery}".`} title="No results" />
      ) : query.data ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {query.data.data.map((product) => (
            <ProductCard
              currency={product.variants[0]?.priceCurrency ?? "SLE"}
              href={`/product/${product.slug}`}
              key={product.id}
              price={Number(product.variants[0]?.priceAmount ?? 0)}
              title={product.title}
            />
          ))}
        </div>
      ) : null}
    </ModuleShell>
  );
}
