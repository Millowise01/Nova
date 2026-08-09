"use client";

import Link from "next/link";

import type { ListProductsParams } from "@nova/api-client";
import { Button, Card, EmptyState, ErrorState, Spinner } from "@nova/ui";
import { formatMoney } from "@nova/utils";

import { useProductsQuery } from "@/features/catalog/catalog.queries";

/** Shared grid used by every filtered product view — category/brand detail pages,
 *  Deals, Flash Sales. One real, parameterized query behind each of them instead
 *  of every page independently reimplementing the same loading/error/empty/grid
 *  states (which is exactly how they ended up all silently sharing the unfiltered
 *  CatalogScreen before this pass). */
export function FilteredCatalogScreen({
  title,
  description,
  filters,
}: {
  title: string;
  description: string;
  filters: Omit<ListProductsParams, "cursor">;
}) {
  const query = useProductsQuery(filters);

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
        description="We couldn't load these products."
        title="Something went wrong"
      />
    );
  }

  const products = query.data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 md:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="text-sm text-slate-600">{description}</p>
      </div>

      {products.length === 0 ? (
        <EmptyState description="No products match this view yet." title="No products" />
      ) : (
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
                      {formatMoney({
                        amount: variant.priceAmount,
                        currency: variant.priceCurrency,
                      })}
                    </p>
                  )}
                </Card>
              </Link>
            );
          })}
        </div>
      )}

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
