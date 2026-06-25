"use client";

import { Search } from "lucide-react";
import { useUiStore } from "@/store/ui-store";

export function SearchBar() {
  return (
    <div className="relative w-full">
      <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
      <input
        aria-label="Search products"
        className="w-full rounded-xl border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none dark:border-slate-700 dark:bg-slate-900"
        placeholder="Search products, categories, brands"
      />
    </div>
  );
}

export function GlobalSearchDialog() {
  const open = useUiStore((s) => s.globalSearchOpen);
  const setOpen = useUiStore((s) => s.setGlobalSearchOpen);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/40 p-4" role="dialog" aria-modal="true" onClick={() => setOpen(false)}>
      <div
        className="mx-auto mt-16 w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <p className="font-semibold">Global Search</p>
          <button className="text-sm text-slate-500" onClick={() => setOpen(false)}>
            Close
          </button>
        </div>
        <SearchBar />
      </div>
    </div>
  );
}
