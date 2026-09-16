import Link from "next/link";

import { Badge, Button, Card } from "@nova/ui";

import { useAddToCartMutation } from "@/features/cart/cart.mutations";
import { SectionTitle } from "@/features/shared/components";
import type { Product } from "@/types/domain";

function ProductCardTile({ product }: { product: Product }) {
  const addToCart = useAddToCartMutation();

  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <Badge tone="neutral">{product.category}</Badge>
        {product.ecoScore ? <Badge tone="success">Eco {product.ecoScore}</Badge> : null}
      </div>
      <Link href={`/product/${product.slug}`}>
        <h3 className="text-base font-semibold text-[color:var(--ds-text)] hover:underline">
          {product.title}
        </h3>
      </Link>
      <p className="text-sm text-slate-600">{product.sellerName}</p>
      <div className="flex items-center justify-between gap-3">
        <p className="text-base font-semibold">{product.price.formatted}</p>
        <Button
          disabled={!product.variantId || !product.inStock || addToCart.isPending}
          onClick={() => {
            if (!product.variantId) return;
            addToCart.mutate({
              variantId: product.variantId,
              quantity: 1,
              unitPrice: { amount: product.price.amount, currency: product.price.currency },
            });
          }}
          size="sm"
        >
          {addToCart.isPending ? "Adding..." : "Add"}
        </Button>
      </div>
    </Card>
  );
}

export function ProductSection({
  title,
  description,
  products,
}: {
  title: string;
  description: string;
  products: Product[];
}) {
  return (
    <section className="mx-auto w-full max-w-7xl space-y-4 px-4 md:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <SectionTitle description={description} title={title} />
        <Link href="/categories">
          <Button variant="ghost">View all</Button>
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCardTile key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
