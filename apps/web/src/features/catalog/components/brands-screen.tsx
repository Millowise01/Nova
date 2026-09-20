"use client";

import Link from "next/link";

import { Button, Card, EmptyState, ErrorState, Spinner } from "@nova/ui";

import { useBrandsQuery } from "@/features/catalog/catalog.queries";

export function BrandsScreen() {
  const query = useBrandsQuery();

  if (query.isLoading) {
    return (
      <div className="flex items-center justify-center gap-3 py-24 text-sm text-[color:var(--color-foreground-muted)]">
        <Spinner className="h-4 w-4" /> Loading brands...
      </div>
    );
  }

  if (query.isError) {
    return (
      <ErrorState
        action={<Button onClick={() => void query.refetch()}>Try again</Button>}
        description="We couldn't load the brand list."
        title="Something went wrong"
      />
    );
  }

  const brands = query.data?.data ?? [];

  if (brands.length === 0) {
    return <EmptyState description="No brands are available yet." title="No brands" />;
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 md:px-6 lg:px-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[color:var(--color-foreground)]">
          Brands
        </h1>
        <p className="mt-1 text-sm text-[color:var(--color-foreground-muted)]">
          Real brands from Nova&apos;s catalog.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {brands.map((brand) => (
          <Link href={`/brands/${brand.slug}`} key={brand.id} className="group">
            <Card className="flex items-center justify-between gap-3 rounded-xl p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
              <h3 className="text-sm font-bold text-[color:var(--color-foreground)] group-hover:text-[color:var(--color-primary)]">
                {brand.name}
              </h3>
              <span className="text-xs font-semibold text-[color:var(--color-foreground-subtle)]">
                {brand.countryCode}
              </span>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
