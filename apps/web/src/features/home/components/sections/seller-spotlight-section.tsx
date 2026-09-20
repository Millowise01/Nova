"use client";

import { Card, Spinner } from "@nova/ui";

import { useSellerProductsQuery, useSellerProfileQuery } from "@/features/catalog/catalog.queries";
import { SectionTitle } from "@/features/shared/components";

/** Previously hardcoded a fake seller ("Freetown Tech Hub") with invented
 *  precision stats (98.2% fulfillment, "under 10 min" response time) — neither
 *  concept exists on the backend. Now spotlights the real seller behind Nova's
 *  first featured product (a genuine, isFeatured-backed signal), showing only
 *  fields GET /sellers/:id and GET /sellers/:id/products actually return. If no
 *  featured/real product is available yet, the section doesn't render rather
 *  than show a half-built card. */
export function SellerSpotlightSection({ sellerId }: { sellerId?: string }) {
  const profileQuery = useSellerProfileQuery(sellerId ?? "");
  const productsQuery = useSellerProductsQuery(sellerId ?? "");

  if (!sellerId || profileQuery.isError) {
    return null;
  }

  if (profileQuery.isLoading || !profileQuery.data) {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-3 text-sm text-[color:var(--color-foreground-muted)]">
          <Spinner className="h-4 w-4" /> Loading seller spotlight...
        </div>
      </section>
    );
  }

  const seller = profileQuery.data;
  const page = productsQuery.data?.pages[0];
  const productCount = page?.data.length ?? 0;
  const hasMoreProducts = page?.pageInfo.hasMore ?? false;
  const memberSinceYear = new Date(seller.memberSince).getFullYear();

  return (
    <section className="mx-auto w-full max-w-7xl space-y-4 px-4 md:px-6 lg:px-8">
      <SectionTitle description="A seller from Nova's catalog." title="Seller Spotlight" />
      <Card className="grid gap-5 rounded-xl p-6 md:grid-cols-3">
        <div>
          <p className="text-xs font-medium text-[color:var(--color-foreground-subtle)]">Seller</p>
          <p className="mt-1 text-xl font-bold text-[color:var(--color-foreground)]">
            {seller.name ?? "Nova seller"}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-[color:var(--color-foreground-subtle)]">
            Member since
          </p>
          <p className="mt-1 text-xl font-bold text-[color:var(--color-foreground)]">
            {memberSinceYear}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-[color:var(--color-foreground-subtle)]">
            Listed products
          </p>
          <p className="mt-1 text-xl font-bold text-[color:var(--color-foreground)]">
            {hasMoreProducts ? `${productCount}+` : productCount}
          </p>
        </div>
      </Card>
    </section>
  );
}
