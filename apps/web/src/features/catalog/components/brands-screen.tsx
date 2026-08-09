"use client";

import Link from "next/link";

import { Button, Card, EmptyState, ErrorState, Spinner } from "@nova/ui";

import { useBrandsQuery } from "@/features/catalog/catalog.queries";

export function BrandsScreen() {
  const query = useBrandsQuery();

  if (query.isLoading) {
    return (
      <div className="flex items-center justify-center gap-3 py-24 text-sm text-slate-600">
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
        <h1 className="text-2xl font-semibold">Brands</h1>
        <p className="text-sm text-slate-600">Real brands from Nova's catalog.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {brands.map((brand) => (
          <Link href={`/brands/${brand.slug}`} key={brand.id}>
            <Card className="flex items-center justify-between gap-3 transition hover:-translate-y-0.5 hover:shadow-md">
              <h3 className="text-sm font-semibold">{brand.name}</h3>
              <span className="text-xs uppercase tracking-wide text-slate-500">
                {brand.countryCode}
              </span>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
