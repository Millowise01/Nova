import Link from "next/link";

import { Image as ImageIcon } from "@nova/icons";
import { Card } from "@nova/ui";

import type { Product } from "@/types/domain";

export function RecommendationsSection({ products }: { products: Product[] }) {
  return (
    <section className="mx-auto w-full max-w-7xl space-y-5 px-4 md:px-6 lg:px-8">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[color:var(--color-foreground)]">
            More to Explore
          </h2>
          <p className="mt-1 text-sm text-[color:var(--color-foreground-muted)]">
            More items from Nova&apos;s catalog.
          </p>
        </div>
        <Link
          href="/categories"
          className="shrink-0 text-sm font-semibold text-[color:var(--color-accent)] hover:underline"
        >
          Browse all →
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {products.map((product) => (
          <Link key={product.id} href={`/product/${product.slug}`} className="block">
            <Card className="flex items-center gap-3 rounded-xl" interactive padding="sm">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[color:var(--color-muted)] text-[color:var(--color-foreground-subtle)]">
                <ImageIcon aria-hidden="true" size={20} strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[color:var(--color-foreground)]">
                  {product.title}
                </p>
                <p className="text-sm font-bold text-[color:var(--color-primary)]">
                  {product.price.formatted}
                </p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
