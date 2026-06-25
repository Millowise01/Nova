"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import type { Product } from "@/types/domain";
import { useCartStore } from "@/store/cart-store";
import { formatSll } from "@/lib/format";
import { EcoScorePill } from "@/components/ui/EcoScorePill";
import { StarRating } from "@/components/ui/StarRating";
import { cn } from "@/lib/utils";

export function ProductCard({ product, className }: { product: Product; className?: string }) {
  const addItem = useCartStore((s) => s.addItem);
  const items = useCartStore((s) => s.items);
  const [wished, setWished] = useState(false);

  const inCart = items.some((i) => i.product.id === product.id);
  const image = product.images[0];

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    addItem(product);
    toast.success(`${product.name} added to cart`);
  }

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    setWished((w) => !w);
    toast.success(wished ? "Removed from wishlist" : "Saved to wishlist");
  }

  return (
    <article className={cn("group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-soft dark:border-slate-800 dark:bg-slate-900", className)}>
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          {image ? (
            <Image
              src={image.url}
              alt={image.alt ?? product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400">No image</div>
          )}

          {product.isEcoCertified && (
            <div className="absolute left-2 top-2">
              <EcoScorePill score={product.ecoScore} certified />
            </div>
          )}

          <button
            onClick={handleWishlist}
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
            className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 shadow transition hover:scale-110 dark:bg-slate-900/90"
          >
            <Heart size={14} className={cn(wished ? "fill-error text-error" : "text-slate-500")} />
          </button>
        </div>

        <div className="space-y-2 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{product.category.name}</p>
          <h3 className="line-clamp-2 text-sm font-semibold text-slate-900 dark:text-slate-100">{product.name}</h3>
          <p className="text-xs text-slate-500">{product.seller.shopName}</p>

          {product.rating !== undefined && (
            <StarRating rating={product.rating} size={12} />
          )}

          <div className="flex items-center justify-between pt-1">
            <span className="font-bold text-slate-900 dark:text-slate-100">{formatSll(product.priceSll)}</span>
            {product.stock < 10 && (
              <span className="text-xs text-warning">Only {product.stock} left</span>
            )}
          </div>
        </div>
      </Link>

      <div className="px-4 pb-4">
        <button
          onClick={handleAddToCart}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition",
            inCart
              ? "bg-success/10 text-success"
              : "bg-primary text-white hover:bg-primary/90",
          )}
        >
          <ShoppingCart size={14} />
          {inCart ? "In Cart" : "Add to Cart"}
        </button>
      </div>
    </article>
  );
}
