"use client";

import Link from "next/link";

import { Button, Card, EmptyState, ErrorState, Spinner } from "@nova/ui";
import { formatMoney } from "@nova/utils";

import { useProductsQuery } from "@/features/catalog/catalog.queries";

export function CatalogScreen() {
  const query = useProductsQuery();

  if (query.isLoading) {
    return (
      <div className="flex items-center justify-center gap-3 py-24 text-sm text-slate-600">
        <Spinner className="h-4 w-4" /> Loading products...
      </div>
    );
  }

  if (query.isError) {
    return (
      <ErrorState
        action={<Button onClick={() => void query.refetch()}>Try again</Button>}
        description="We couldn't load the product catalog."
        title="Something went wrong"
      />
    );
  }

  const products = query.data?.pages.flatMap((page) => page.data) ?? [];

  if (products.length === 0) {
    return <EmptyState description="No products are available yet." title="No products" />;
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 md:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-semibold">Product Catalog</h1>
        <p className="text-sm text-slate-600">Real listings from Nova's catalog.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => {
          const variant = product.variants[0];
          return (
            <Link href={`/product/${product.slug}`} key={product.id}>
              <Card className="h-full space-y-2 transition hover:shadow-md">
                <div className="flex aspect-square items-center justify-center rounded-lg bg-slate-50 text-xs text-slate-400">
                  No image
                </div>
                <p className="line-clamp-2 text-sm font-semibold">{product.title}</p>
                {variant && (
                  <p className="text-sm font-semibold text-[color:var(--ds-primary)]">
                    {formatMoney({ amount: variant.priceAmount, currency: variant.priceCurrency })}
                  </p>
                )}
              </Card>
            </Link>
          );
        })}
      </div>

      {query.hasNextPage && (
        <div className="flex justify-center">
          <Button
            disabled={query.isFetchingNextPage}
            onClick={() => void query.fetchNextPage()}
            variant="outline"
          >
            {query.isFetchingNextPage ? "Loading..." : "Load more"}
          </Button>
        </div>
      )}
    </div>
  );
}
