import { Card } from "@nova/ui";

import type { Product } from "@/types/domain";

// Was previously "AI Recommendations" wrapped in a fake-async Promise.resolve —
// there's no AI/personalization backend, it was just the first 4 products.
// Renders that same slice honestly, as a synchronous prop like ProductSection.
export function RecommendationsSection({ products }: { products: Product[] }) {
  return (
    <section className="mx-auto w-full max-w-7xl space-y-4 px-4 md:px-6 lg:px-8">
      <div>
        <h2 className="text-2xl font-semibold">More to Explore</h2>
        <p className="text-sm text-slate-600">More items from Nova&apos;s catalog.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {products.map((product) => (
          <Card key={product.id}>
            <p className="text-sm font-semibold">{product.title}</p>
            <p className="mt-2 text-sm text-slate-600">{product.price.formatted}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
