"use client";

import { Heart, ShoppingCart, Image as ImageIcon } from "@nova/icons";
import { Badge, Button, ErrorState, Spinner } from "@nova/ui";
import { formatMoney } from "@nova/utils";

import { useAddToCartMutation } from "@/features/cart/cart.mutations";
import { useProductQuery } from "@/features/catalog/catalog.queries";
import {
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
} from "@/features/wishlist/wishlist.mutations";
import { useWishlistQuery } from "@/features/wishlist/wishlist.queries";
import { useAuth } from "@/providers/auth-provider";

export function ProductScreen({ slug }: { slug: string }) {
  const query = useProductQuery(slug);
  const addToCart = useAddToCartMutation();
  const { isAuthenticated } = useAuth();
  const wishlistQuery = useWishlistQuery();
  const addToWishlist = useAddToWishlistMutation();
  const removeFromWishlist = useRemoveFromWishlistMutation();

  if (query.isLoading) {
    return (
      <div className="flex items-center justify-center gap-3 py-24 text-sm text-[color:var(--color-foreground-muted)]">
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
  const wishlistItem = wishlistQuery.data?.items.find((item) => item.productId === product.id);
  const inStock = variant && variant.stockQuantity > 0;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6 lg:px-8">
      <div className="grid gap-10 md:grid-cols-2">
        {/* Image */}
        <div className="flex aspect-square items-center justify-center rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-muted)] text-[color:var(--color-foreground-subtle)]">
          <div className="flex flex-col items-center gap-2">
            <ImageIcon aria-hidden="true" size={48} strokeWidth={1.5} />
            <span className="text-sm">No image available</span>
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-xs font-semibold text-[color:var(--color-foreground-subtle)]">
              {product.category.name}
            </p>
            <h1 className="mt-1 text-3xl font-bold leading-tight text-[color:var(--color-foreground)]">
              {product.title}
            </h1>
          </div>

          {variant && (
            <p className="text-3xl font-bold text-[color:var(--color-primary)]">
              {formatMoney({ amount: variant.priceAmount, currency: variant.priceCurrency })}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {product.brand && <Badge className="rounded-full">{product.brand.name}</Badge>}
            <Badge tone={inStock ? "success" : "error"} className="rounded-full">
              {inStock ? `${variant.stockQuantity} in stock` : "Out of stock"}
            </Badge>
          </div>

          {product.description && (
            <p className="text-sm leading-relaxed text-[color:var(--color-foreground-muted)]">
              {product.description}
            </p>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              disabled={!variant || !inStock || addToCart.isPending}
              onClick={() => {
                if (!variant) return;
                addToCart.mutate({
                  variantId: variant.id,
                  quantity: 1,
                  unitPrice: { amount: variant.priceAmount, currency: variant.priceCurrency },
                });
              }}
              size="lg"
              icon={<ShoppingCart size={16} />}
              className="flex-1"
            >
              {addToCart.isPending ? "Adding..." : "Add to Cart"}
            </Button>

            {isAuthenticated && (
              <Button
                disabled={addToWishlist.isPending || removeFromWishlist.isPending}
                onClick={() => {
                  if (wishlistItem) {
                    removeFromWishlist.mutate(wishlistItem.id);
                  } else {
                    addToWishlist.mutate({
                      productId: product.id,
                      optimisticProduct: {
                        id: product.id,
                        title: product.title,
                        slug: product.slug,
                      },
                    });
                  }
                }}
                variant="outline"
                size="lg"
                icon={<Heart size={16} />}
              >
                {wishlistItem ? "Saved" : "Save"}
              </Button>
            )}
          </div>

          {product.variants.length > 1 && (
            <div className="rounded-xl border border-[color:var(--color-border)] p-4">
              <p className="mb-2 text-sm font-semibold text-[color:var(--color-foreground-muted)]">
                Other variants
              </p>
              <ul className="space-y-1.5">
                {product.variants.map((v) => (
                  <li key={v.id} className="flex items-center justify-between text-sm">
                    <span className="text-[color:var(--color-foreground-muted)]">{v.name}</span>
                    <span className="font-semibold text-[color:var(--color-foreground)]">
                      {formatMoney({ amount: v.priceAmount, currency: v.priceCurrency })}
                    </span>
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
