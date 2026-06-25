"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Trash2 } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { formatSll } from "@/lib/format";
import { Button } from "@/components/ui/Button";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="space-y-6 py-6">
        <h1 className="text-2xl font-bold">Shopping Cart</h1>
        <div className="rounded-2xl border border-dashed border-slate-300 p-16 text-center dark:border-slate-700">
          <ShoppingCart size={40} className="mx-auto mb-3 text-slate-300" />
          <p className="font-medium">Your cart is empty</p>
          <p className="mt-1 text-sm text-slate-500">Browse products and add them here</p>
          <Link
            href="/catalog"
            className="mt-5 inline-flex rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary/90"
          >
            Shop Now
          </Link>
        </div>
      </div>
    );
  }

  const sub = subtotal();
  const delivery = 15_000;
  const total = sub + delivery;

  return (
    <div className="space-y-6 py-6">
      <h1 className="text-2xl font-bold">Shopping Cart ({items.length})</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Items */}
        <div className="space-y-3">
          {items.map(({ product, quantity }) => {
            const image = product.images[0];
            return (
              <div
                key={product.id}
                className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
              >
                <Link href={`/products/${product.slug}`} className="flex-shrink-0">
                  <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-slate-100">
                    {image && (
                      <Image
                        src={image.url}
                        alt={image.alt ?? product.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    )}
                  </div>
                </Link>
                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex justify-between gap-2">
                    <div>
                      <Link
                        href={`/products/${product.slug}`}
                        className="font-semibold hover:text-primary"
                      >
                        {product.name}
                      </Link>
                      <p className="text-xs text-slate-500">{product.seller.shopName}</p>
                    </div>
                    <button
                      onClick={() => removeItem(product.id)}
                      aria-label="Remove"
                      className="flex-shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-error dark:hover:bg-red-950/20"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="px-3 py-1.5 text-slate-600 hover:text-primary"
                      >
                        −
                      </button>
                      <span className="min-w-[2rem] text-center text-sm font-medium">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="px-3 py-1.5 text-slate-600 hover:text-primary"
                      >
                        +
                      </button>
                    </div>
                    <p className="font-bold">{formatSll(product.priceSll * quantity)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 font-semibold">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Subtotal</span>
              <span>{formatSll(sub)}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Delivery (est.)</span>
              <span>{formatSll(delivery)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2 font-bold dark:border-slate-700">
              <span>Total</span>
              <span className="text-primary">{formatSll(total)}</span>
            </div>
          </div>
          <Link href="/checkout">
            <Button className="mt-5 w-full py-3">Proceed to Checkout</Button>
          </Link>
          <Link
            href="/catalog"
            className="mt-3 block text-center text-sm text-slate-500 hover:text-primary"
          >
            Continue Shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
