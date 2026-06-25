"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, X } from "lucide-react";
import { SEED_PRODUCTS } from "@/lib/seed-data";
import { formatSll } from "@/lib/format";
import { EcoScorePill } from "@/components/ui/EcoScorePill";
import { StarRating } from "@/components/ui/StarRating";
import { useCartStore } from "@/store/cart-store";
import toast from "react-hot-toast";
import type { Product } from "@/types/domain";

const MAX_COMPARE = 3;

export default function ProductComparisonPage() {
  const [selected, setSelected] = useState<Product[]>([SEED_PRODUCTS[0]!, SEED_PRODUCTS[1]!]);
  const addItem = useCartStore((s) => s.addItem);

  function addProduct(product: Product) {
    if (selected.length >= MAX_COMPARE) { toast.error("Max 3 products"); return; }
    if (selected.some((p) => p.id === product.id)) return;
    setSelected((prev) => [...prev, product]);
  }

  function removeProduct(id: string) {
    setSelected((prev) => prev.filter((p) => p.id !== id));
  }

  const attrs: { label: string; render: (p: Product) => React.ReactNode }[] = [
    { label: "Price", render: (p) => <span className="font-bold text-primary">{formatSll(p.priceSll)}</span> },
    { label: "Category", render: (p) => p.category.name },
    { label: "Eco Score", render: (p) => <EcoScorePill score={p.ecoScore} /> },
    { label: "Carbon Impact", render: (p) => p.carbonImpact },
    { label: "Eco Certified", render: (p) => (p.isEcoCertified ? "✅ Yes" : "❌ No") },
    { label: "Rating", render: (p) => p.rating ? <StarRating rating={p.rating} size={12} /> : "—" },
    { label: "Stock", render: (p) => `${p.stock} units` },
    { label: "Seller", render: (p) => p.seller.shopName },
  ];

  const available = SEED_PRODUCTS.filter((p) => !selected.some((s) => s.id === p.id));

  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-2xl font-bold">Product Comparison</h1>
        <p className="mt-1 text-sm text-slate-500">Compare up to 3 products side by side</p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800">
              <th className="w-36 p-4 text-left text-xs font-semibold uppercase text-slate-500" />
              {selected.map((product) => (
                <th key={product.id} className="min-w-[180px] p-4 text-left">
                  <div className="space-y-2">
                    <div className="relative aspect-square overflow-hidden rounded-xl bg-slate-100">
                      {product.images[0] && (
                        <Image
                          src={product.images[0].url}
                          alt={product.name}
                          fill
                          sizes="160px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex items-start justify-between gap-1">
                      <Link href={`/products/${product.slug}`} className="font-semibold leading-tight hover:text-primary">
                        {product.name}
                      </Link>
                      <button onClick={() => removeProduct(product.id)} aria-label="Remove" className="flex-shrink-0 rounded p-0.5 hover:bg-slate-100 dark:hover:bg-slate-800">
                        <X size={13} />
                      </button>
                    </div>
                    <button
                      onClick={() => { addItem(product); toast.success("Added to cart"); }}
                      className="w-full rounded-xl bg-primary py-2 text-xs font-semibold text-white hover:bg-primary/90"
                    >
                      Add to Cart
                    </button>
                  </div>
                </th>
              ))}
              {selected.length < MAX_COMPARE && (
                <th className="min-w-[180px] p-4">
                  <div className="rounded-2xl border-2 border-dashed border-slate-200 p-4 dark:border-slate-700">
                    <p className="mb-2 text-xs text-slate-400">Add a product</p>
                    <select
                      onChange={(e) => {
                        const p = SEED_PRODUCTS.find((x) => x.id === e.target.value);
                        if (p) addProduct(p);
                        e.target.value = "";
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-900"
                    >
                      <option value="">Select…</option>
                      {available.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {attrs.map(({ label, render }) => (
              <tr key={label}>
                <td className="p-4 text-xs font-semibold text-slate-500">{label}</td>
                {selected.map((p) => (
                  <td key={p.id} className="p-4 text-slate-700 dark:text-slate-300">
                    {render(p)}
                  </td>
                ))}
                {selected.length < MAX_COMPARE && <td />}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
