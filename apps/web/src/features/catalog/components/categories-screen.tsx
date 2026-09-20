"use client";

import Link from "next/link";

import { Button, Card, EmptyState, ErrorState, Spinner } from "@nova/ui";

import { useCategoriesQuery } from "@/features/catalog/catalog.queries";

export function CategoriesScreen() {
  const query = useCategoriesQuery();

  if (query.isLoading) {
    return (
      <div className="flex items-center justify-center gap-3 py-24 text-sm text-[color:var(--color-foreground-muted)]">
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
        <h1 className="text-3xl font-bold tracking-tight text-[color:var(--color-foreground)]">
          Categories
        </h1>
        <p className="mt-1 text-sm text-[color:var(--color-foreground-muted)]">
          Browse Nova&apos;s real category taxonomy.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {categories.map((category) => (
          <Link href={`/categories/${category.slug}`} key={category.id} className="group">
            <Card className="h-full space-y-1 rounded-xl p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
              <h3 className="text-base font-bold text-[color:var(--color-foreground)] group-hover:text-[color:var(--color-primary)]">
                {category.name}
              </h3>
              <p className="text-xs font-semibold text-[color:var(--color-foreground-subtle)]">
                {category.countryCode}
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
