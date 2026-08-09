"use client";

import Link from "next/link";

import { Button, Card, EmptyState, ErrorState, Spinner } from "@nova/ui";

import { useCategoriesQuery } from "@/features/catalog/catalog.queries";

export function CategoriesScreen() {
  const query = useCategoriesQuery();

  if (query.isLoading) {
    return (
      <div className="flex items-center justify-center gap-3 py-24 text-sm text-slate-600">
        <Spinner className="h-4 w-4" /> Loading categories...
      </div>
    );
  }

  if (query.isError) {
    return (
      <ErrorState
        action={<Button onClick={() => void query.refetch()}>Try again</Button>}
        description="We couldn't load the category list."
        title="Something went wrong"
      />
    );
  }

  const categories = query.data?.data ?? [];

  if (categories.length === 0) {
    return <EmptyState description="No categories are available yet." title="No categories" />;
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 md:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-semibold">Categories</h1>
        <p className="text-sm text-slate-600">Browse Nova's real category taxonomy.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {categories.map((category) => (
          <Link href={`/categories/${category.slug}`} key={category.id}>
            <Card className="h-full space-y-1 transition hover:-translate-y-0.5 hover:shadow-md">
              <h3 className="text-base font-semibold">{category.name}</h3>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                {category.countryCode}
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
