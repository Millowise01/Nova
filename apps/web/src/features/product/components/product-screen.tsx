"use client";

import { Badge, Button, ErrorState, Spinner } from "@nova/ui";
import { formatMoney } from "@nova/utils";

import { useAddToCartMutation } from "@/features/cart/cart.mutations";
import { useProductQuery } from "@/features/catalog/catalog.queries";

export function ProductScreen({ slug }: { slug: string }) {
  const query = useProductQuery(slug);
  const addToCart = useAddToCartMutation();

  if (query.isLoading) {
    return (
      <div className="flex items-center justify-center gap-3 py-24 text-sm text-slate-600">
        <Spinner className="h-4 w-4" /> Loading product...
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <ErrorState
        action={<Button onClick={() => void query.refetch()}>Try again</Button>}
        description="We couldn't load this product. It may no longer be available."
        title="Product not found"
      />
    );
  }

  const product = query.data;
  const variant = product.variants[0];

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8 md:px-6 lg:px-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="flex aspect-square items-center justify-center rounded-2xl border border-[color:var(--ds-border)] bg-slate-50 text-sm text-slate-400">
          No product image available
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-slate-500">{product.category.name}</p>
            <h1 className="text-2xl font-semibold">{product.title}</h1>
          </div>

          {variant && (
            <p className="text-2xl font-semibold text-[color:var(--ds-primary)]">
              {formatMoney({ amount: variant.priceAmount, currency: variant.priceCurrency })}
            </p>
          )}

          {product.description && <p className="text-sm text-slate-600">{product.description}</p>}

          <div className="flex flex-wrap gap-2">
            {product.brand && <Badge>{product.brand.name}</Badge>}
            <Badge tone={variant && variant.stockQuantity > 0 ? "success" : "error"}>
              {variant && variant.stockQuantity > 0
                ? `${variant.stockQuantity} in stock`
                : "Out of stock"}
            </Badge>
          </div>

          <Button
            className="w-full sm:w-auto"
            disabled={!variant || variant.stockQuantity === 0 || addToCart.isPending}
            onClick={() => {
              if (!variant) return;
              addToCart.mutate({
                variantId: variant.id,
                quantity: 1,
                unitPrice: { amount: variant.priceAmount, currency: variant.priceCurrency },
              });
            }}
          >
            {addToCart.isPending ? "Adding..." : "Add to Cart"}
          </Button>

          {product.variants.length > 1 && (
            <div className="space-y-2 pt-2">
              <p className="text-sm font-semibold">Other variants</p>
              <ul className="space-y-1 text-sm text-slate-600">
                {product.variants.map((v) => (
                  <li key={v.id}>
                    {v.name} — {formatMoney({ amount: v.priceAmount, currency: v.priceCurrency })}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
