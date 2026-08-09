"use client";

import { EmptyState, ErrorState, Spinner } from "@nova/ui";

import { useCategoriesQuery } from "@/features/catalog/catalog.queries";

import { FilteredCatalogScreen } from "./filtered-catalog-screen";

export function CategoryDetailScreen({ slug }: { slug: string }) {
  const categoriesQuery = useCategoriesQuery();

  if (categoriesQuery.isLoading) {
    return (
      <div className="flex items-center justify-center gap-3 py-24 text-sm text-slate-600">
        <Spinner className="h-4 w-4" /> Loading category...
      </div>
    );
  }

  if (categoriesQuery.isError) {
    return (
      <ErrorState description="We couldn't load this category." title="Something went wrong" />
    );
  }

  const category = categoriesQuery.data?.data.find((c) => c.slug === slug);
  if (!category) {
    return <EmptyState description="No category matches this URL." title="Category not found" />;
  }

  return (
    <FilteredCatalogScreen
      description={`Products in ${category.name}.`}
      filters={{ categoryId: category.id }}
      title={category.name}
    />
  );
}
