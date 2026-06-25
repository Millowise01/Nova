"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/types/domain";
import { ProductCard } from "@/components/commerce/ProductCard";

export function ProductCarousel({ products, title }: { products: Product[]; title?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  function scroll(dir: "left" | "right") {
    if (!ref.current) return;
    ref.current.scrollBy({ left: dir === "right" ? 320 : -320, behavior: "smooth" });
  }

  return (
    <div>
      {title && (
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <div className="flex gap-1">
            <button onClick={() => scroll("left")} aria-label="Scroll left" className="rounded-xl border border-slate-200 p-2 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"><ChevronLeft size={16} /></button>
            <button onClick={() => scroll("right")} aria-label="Scroll right" className="rounded-xl border border-slate-200 p-2 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"><ChevronRight size={16} /></button>
          </div>
        </div>
      )}
      <div ref={ref} className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x">
        {products.map((p) => (
          <div key={p.id} className="w-64 flex-shrink-0 snap-start">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </div>
  );
}
