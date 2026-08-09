import Link from "next/link";

import { Card } from "@nova/ui";
import type { CategoryResponse } from "@nova/validation";

import { SectionTitle } from "@/features/shared/components";

export function CategoriesSection({ categories }: { categories: CategoryResponse[] }) {
  return (
    <section className="mx-auto w-full max-w-7xl space-y-4 px-4 md:px-6 lg:px-8">
      <SectionTitle
        description="Jump into the most active shopping categories."
        title="Featured Categories"
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {categories.map((category) => (
          <Link href={`/categories/${category.slug}`} key={category.id}>
            <Card className="h-full space-y-2 transition hover:-translate-y-0.5 hover:shadow-md">
              <h3 className="text-base font-semibold">{category.name}</h3>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
