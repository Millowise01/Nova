import Link from "next/link";

import { Image as ImageIcon, ShoppingCart } from "@nova/icons";
import { Badge, Button, Card } from "@nova/ui";

import { useAddToCartMutation } from "@/features/cart/cart.mutations";
import { SectionTitle } from "@/features/shared/components";
import type { Product } from "@/types/domain";

function ProductCardTile({ product }: { product: Product }) {
  const addToCart = useAddToCartMutation();

  return (
    <Card
      className="group flex flex-col overflow-hidden rounded-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
      padding="none"
    >
      {/* Image area */}
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-[color:var(--color-muted)]">
          <div className="flex flex-col items-center gap-1 text-[color:var(--color-foreground-subtle)]">
            <ImageIcon aria-hidden="true" size={32} strokeWidth={1.5} />
            <span className="text-xs">No image</span>
          </div>
          {product.ecoScore && (
            <Badge className="absolute left-2 top-2" tone="success">
              Eco {product.ecoScore}
            </Badge>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs font-medium text-[color:var(--color-foreground-subtle)]">
          {product.category}
        </p>
        <Link href={`/product/${product.slug}`}>
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-[color:var(--color-foreground)] group-hover:text-[color:var(--color-primary)]">
            {product.title}
          </h3>
        </Link>
        <p className="text-xs text-[color:var(--color-foreground-muted)]">{product.sellerName}</p>

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <p className="text-base font-bold text-[color:var(--color-primary)]">
            {product.price.formatted}
          </p>
          <Button
            aria-label={`Add ${product.title} to cart`}
            disabled={!product.variantId || !product.inStock || addToCart.isPending}
            onClick={() => {
              if (!product.variantId) return;
              addToCart.mutate({
                variantId: product.variantId,
                quantity: 1,
                unitPrice: { amount: product.price.amount, currency: product.price.currency },
              });
            }}
            size="icon"
            variant="accent"
          >
            <ShoppingCart aria-hidden="true" size={16} />
          </Button>
        </div>
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
    <section className="mx-auto w-full max-w-7xl space-y-5 px-4 md:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <SectionTitle description={description} title={title} />
        <Link
          href="/categories"
          className="text-sm font-semibold text-[color:var(--color-accent)] hover:underline"
        >
          View all →
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
