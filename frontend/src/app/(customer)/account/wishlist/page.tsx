"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";
import { useCartStore } from "@/store/cart-store";
import { SEED_PRODUCTS } from "@/lib/seed-data";
import { formatSll } from "@/lib/format";
import { EcoScorePill } from "@/components/ui/EcoScorePill";

const INITIAL_WISHLIST = SEED_PRODUCTS.slice(0, 5).map((p) => p.id);

export default function WishlistPage() {
  const [wishlistIds, setWishlistIds] = useState<string[]>(INITIAL_WISHLIST);
  const addItem = useCartStore((s) => s.addItem);

  const wishlistProducts = SEED_PRODUCTS.filter((p) => wishlistIds.includes(p.id));

  function remove(id: string) {
    setWishlistIds((prev) => prev.filter((w) => w !== id));
    toast.success("Removed from wishlist");
  }

  return (
    <div className="space-y-6 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Wishlist</h1>
        <p className="text-sm text-slate-500">{wishlistProducts.length} saved items</p>
      </div>

      {wishlistProducts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-700">
          <Heart size={36} className="mx-auto mb-3 text-slate-300" />
          <p className="font-medium">Your wishlist is empty</p>
          <p className="mt-1 text-sm text-slate-500">Save products to revisit them later</p>
          <Link
            href="/catalog"
            className="mt-4 inline-flex rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {wishlistProducts.map((product) => {
            const image = product.images[0];
            return (
              <div
                key={product.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
              >
                <Link href={`/products/${product.slug}`} className="block">
                  <div className="relative aspect-video overflow-hidden bg-slate-100">
                    {image && (
                      <Image
                        src={image.url}
                        alt={image.alt ?? product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                      />
                    )}
                    {product.isEcoCertified && (
                      <div className="absolute left-2 top-2">
                        <EcoScorePill score={product.ecoScore} certified />
                      </div>
                    )}
                  </div>
                </Link>
                <div className="p-4">
                  <p className="text-xs text-slate-500">{product.category.name}</p>
                  <Link href={`/products/${product.slug}`}>
                    <h3 className="mt-0.5 line-clamp-1 font-semibold hover:text-primary">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="mt-1 font-bold text-slate-900 dark:text-slate-100">
                    {formatSll(product.priceSll)}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => {
                        addItem(product);
                        toast.success("Added to cart");
                      }}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary py-2 text-xs font-semibold text-white hover:bg-primary/90"
                    >
                      <ShoppingCart size={13} /> Add to Cart
                    </button>
                    <button
                      onClick={() => remove(product.id)}
                      aria-label="Remove from wishlist"
                      className="rounded-xl border border-slate-200 px-3 py-2 text-xs text-error hover:bg-red-50 dark:border-slate-700 dark:hover:bg-red-950/20"
                    >
                      <Heart size={13} className="fill-error" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
