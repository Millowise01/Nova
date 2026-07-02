"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, Spinner } from "@nova/ui";
import type { Product } from "@/types/domain";

function getAiRecommendations(products: Product[]) {
  return Promise.resolve(products.slice(0, 4));
}

export function RecommendationsSection({ products }: { products: Product[] }) {
  const query = useQuery({
    queryKey: ["home", "ai-recommendations"],
    queryFn: () => getAiRecommendations(products)
  });

  return (
    <section className="mx-auto w-full max-w-7xl space-y-4 px-4 md:px-6 lg:px-8">
      <div>
        <h2 className="text-2xl font-semibold">AI Recommendations</h2>
        <p className="text-sm text-slate-600">Personalized product suggestions based on your browsing profile.</p>
      </div>
      {query.isLoading ? (
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <Spinner className="h-4 w-4" /> Generating recommendations...
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {query.data?.map((product) => (
            <Card key={product.id}>
              <p className="text-sm font-semibold">{product.title}</p>
              <p className="mt-2 text-sm text-slate-600">{product.price.formatted}</p>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
