import Link from "next/link";

import { Card } from "@nova/ui";
import type { CategoryResponse } from "@nova/validation";

import { SectionTitle } from "@/features/shared/components";

export function CategoriesSection({ categories }: { categories: CategoryResponse[] }) {
  return (
    <section className="mx-auto w-full max-w-7xl space-y-5 px-4 md:px-6 lg:px-8">
      <SectionTitle
        description="Jump into the most active shopping categories."
        title="Featured Categories"
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {categories.map((category) => (
          <Link href={`/categories/${category.slug}`} key={category.id} className="block">
            <Card
              className="flex h-full flex-col items-center gap-2 rounded-xl text-center"
              interactive
              padding="sm"
            >
              {/* Generic initial placeholder — replace with real category icons */}
              <span
                aria-hidden="true"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-[color:var(--color-primary-subtle)] text-lg font-semibold text-[color:var(--color-primary)]"
              >
                {category.name.charAt(0).toUpperCase()}
              </span>
              <span className="text-sm font-medium leading-tight text-[color:var(--color-foreground)]">
                {category.name}
              </span>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
