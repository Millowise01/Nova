"use client";

import { EmptyState, ErrorState, Spinner } from "@nova/ui";

import { useBrandsQuery } from "@/features/catalog/catalog.queries";

import { FilteredCatalogScreen } from "./filtered-catalog-screen";

export function BrandDetailScreen({ slug }: { slug: string }) {
  const brandsQuery = useBrandsQuery();

  if (brandsQuery.isLoading) {
    return (
      <div className="flex items-center justify-center gap-3 py-24 text-sm text-slate-600">
        <Spinner className="h-4 w-4" /> Loading brand...
      </div>
    );
  }

  if (brandsQuery.isError) {
    return <ErrorState description="We couldn't load this brand." title="Something went wrong" />;
  }

  const brand = brandsQuery.data?.data.find((b) => b.slug === slug);
  if (!brand) {
    return <EmptyState description="No brand matches this URL." title="Brand not found" />;
  }

  return (
    <FilteredCatalogScreen
      description={`Products from ${brand.name}.`}
      filters={{ brandId: brand.id }}
      title={brand.name}
    />
  );
}
