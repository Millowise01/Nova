"use client";

import Link from "next/link";

import { Image as ImageIcon } from "@nova/icons";
import { Button, Card, EmptyState, ErrorState, Spinner } from "@nova/ui";
import { formatMoney } from "@nova/utils";

import { useProductsQuery } from "@/features/catalog/catalog.queries";

export function CatalogScreen() {
  const query = useProductsQuery();

  if (query.isLoading) {
    return (
      <div className="flex items-center justify-center gap-3 py-24 text-sm text-[color:var(--color-foreground-muted)]">
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
        <h1 className="text-3xl font-bold tracking-tight text-[color:var(--color-foreground)]">
          Product Catalog
        </h1>
        <p className="mt-1 text-sm text-[color:var(--color-foreground-muted)]">
          Real listings from Nova&apos;s catalog.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => {
          const variant = product.variants[0];
          return (
            <Link href={`/product/${product.slug}`} key={product.id} className="group">
              <Card
                className="overflow-hidden rounded-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
                padding="none"
              >
                <div className="flex aspect-[4/3] items-center justify-center bg-[color:var(--color-muted)] text-[color:var(--color-foreground-subtle)]">
                  <ImageIcon aria-hidden="true" size={32} strokeWidth={1.5} />
                </div>
                <div className="p-4">
                  <p className="line-clamp-2 text-sm font-semibold text-[color:var(--color-foreground)] group-hover:text-[color:var(--color-primary)]">
                    {product.title}
                  </p>
                  {variant && (
                    <p className="mt-1.5 text-base font-bold text-[color:var(--color-primary)]">
                      {formatMoney({
                        amount: variant.priceAmount,
                        currency: variant.priceCurrency,
                      })}
                    </p>
                  )}
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {query.hasNextPage && (
        <div className="flex justify-center pt-4">
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
