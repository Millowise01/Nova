"use client";

import { ShoppingCart, Heart } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import type { Product } from "@/types/domain";
import { useCartStore } from "@/store/cart-store";
import { cn } from "@/lib/utils";

export function AddToCartButton({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const items = useCartStore((s) => s.items);
  const [qty, setQty] = useState(1);
  const [wished, setWished] = useState(false);

  const inCart = items.some((i) => i.product.id === product.id);

  function handleAdd() {
    addItem(product, qty);
    toast.success(`${product.name} added to cart`);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Qty</label>
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700">
          <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-2 text-slate-600 hover:text-primary">−</button>
          <span className="min-w-[2rem] text-center text-sm font-medium">{qty}</span>
          <button type="button" onClick={() => setQty((q) => Math.min(product.stock, q + 1))} className="px-3 py-2 text-slate-600 hover:text-primary">+</button>
        </div>
        <span className="text-xs text-slate-400">{product.stock} available</span>
      </div>
      <div className="flex gap-3">
        <button
          onClick={handleAdd}
          disabled={product.stock === 0}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition",
            inCart ? "bg-success/10 text-success" : "bg-primary text-white hover:bg-primary/90 disabled:opacity-50",
          )}
        >
          <ShoppingCart size={16} />
          {inCart ? "Added to Cart" : product.stock === 0 ? "Out of Stock" : "Add to Cart"}
        </button>
        <button
          onClick={() => { setWished((w) => !w); toast.success(wished ? "Removed from wishlist" : "Saved to wishlist"); }}
          className={cn("rounded-xl border px-4 py-3 transition", wished ? "border-error bg-error/5 text-error" : "border-slate-200 hover:border-primary dark:border-slate-700")}
          aria-label="Toggle wishlist"
        >
          <Heart size={16} className={wished ? "fill-error" : ""} />
        </button>
      </div>
    </div>
  );
}
