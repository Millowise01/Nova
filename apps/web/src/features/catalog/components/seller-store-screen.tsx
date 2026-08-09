"use client";

import Link from "next/link";

import { Avatar, Button, Card, EmptyState, ErrorState, Spinner } from "@nova/ui";
import { formatMoney } from "@nova/utils";

import { useSellerProductsQuery, useSellerProfileQuery } from "@/features/catalog/catalog.queries";

/** Public, read-only storefront — no auth required, matches GET /v1/sellers/:id
 *  and GET /v1/sellers/:id/products. The route param is named `:slug` (matching
 *  every other detail page's convention), but there's no seller-slug concept in
 *  the schema (only a "seller" role string on User, no dedicated Seller profile
 *  table) — it's actually treated as the seller's user ID here. */
export function SellerStoreScreen({ sellerId }: { sellerId: string }) {
  const profileQuery = useSellerProfileQuery(sellerId);
  const productsQuery = useSellerProductsQuery(sellerId);

  if (profileQuery.isLoading) {
    return (
      <div className="flex items-center justify-center gap-3 py-24 text-sm text-slate-600">
        <Spinner className="h-4 w-4" /> Loading storefront...
      </div>
    );
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <ErrorState
        description="This seller storefront doesn't exist or is no longer available."
        title="Storefront not found"
      />
    );
  }

  const seller = profileQuery.data;
  const products = productsQuery.data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 md:px-6 lg:px-8">
      <div className="flex items-center gap-4">
        <Avatar name={seller.name ?? "Seller"} size="lg" />
        <div>
          <h1 className="text-2xl font-semibold">{seller.name ?? "Nova Seller"}</h1>
          <p className="text-sm text-slate-600">
            Member since {new Date(seller.memberSince).toLocaleDateString()}
          </p>
        </div>
      </div>

      {productsQuery.isLoading ? (
        <div className="flex items-center justify-center gap-3 py-12 text-sm text-slate-600">
          <Spinner className="h-4 w-4" /> Loading products...
        </div>
      ) : products.length === 0 ? (
        <EmptyState description="This seller has no listings yet." title="No products" />
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

      {productsQuery.hasNextPage && (
        <div className="flex justify-center">
          <Button
            disabled={productsQuery.isFetchingNextPage}
            onClick={() => void productsQuery.fetchNextPage()}
            variant="outline"
          >
            {productsQuery.isFetchingNextPage ? "Loading..." : "Load more"}
          </Button>
        </div>
      )}
    </div>
  );
}
