"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { useUiStore } from "@/store/ui-store";
import { SEED_PRODUCTS } from "@/lib/seed-data";
import { formatSll } from "@/lib/format";

export function SearchBar({ className }: { className?: string }) {
  const setOpen = useUiStore((s) => s.setGlobalSearchOpen);
  return (
    <button
      onClick={() => setOpen(true)}
      aria-label="Search"
      className={`flex w-full items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-500 shadow-sm transition hover:border-primary dark:border-slate-700 dark:bg-slate-900 dark:hover:border-primary ${className ?? ""}`}
    >
      <Search size={15} />
      <span>Search products, categories, brands…</span>
      <kbd className="ml-auto hidden rounded border border-slate-200 px-1.5 py-0.5 text-xs text-slate-400 dark:border-slate-700 sm:inline">⌘K</kbd>
    </button>
  );
}

export function GlobalSearchDialog() {
  const open = useUiStore((s) => s.globalSearchOpen);
  const setOpen = useUiStore((s) => s.setGlobalSearchOpen);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const results = query.trim().length > 1
    ? SEED_PRODUCTS.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.name.toLowerCase().includes(query.toLowerCase()),
      ).slice(0, 6)
    : [];

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setOpen]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-slate-900/50 p-4 pt-[15vh]"
      role="dialog"
      aria-modal="true"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 dark:border-slate-800">
          <Search size={16} className="text-slate-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, categories, brands…"
            className="flex-1 bg-transparent py-4 text-sm outline-none placeholder:text-slate-400 dark:text-slate-100"
          />
          <button onClick={() => setOpen(false)} aria-label="Close search" className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={15} />
          </button>
        </div>

        {results.length > 0 && (
          <ul className="max-h-72 divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800">
            {results.map((product) => (
              <li key={product.id}>
                <Link
                  href={`/products/${product.slug}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
                    {product.images[0] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.images[0].url} alt={product.name} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{product.name}</p>
                    <p className="text-xs text-slate-500">{product.category.name} · {formatSll(product.priceSll)}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {query.trim().length > 1 && results.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-slate-500">
            No products found for &ldquo;{query}&rdquo;
          </div>
        )}

        <div className="border-t border-slate-100 px-4 py-2.5 dark:border-slate-800">
          <Link
            href={`/search?q=${encodeURIComponent(query)}`}
            onClick={() => setOpen(false)}
            className="text-xs font-medium text-primary hover:underline"
          >
            See all results for &ldquo;{query}&rdquo; →
          </Link>
        </div>
      </div>
    </div>
  );
}
