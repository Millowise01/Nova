import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SEED_CATEGORIES } from "@/lib/seed-data";

export const metadata: Metadata = { title: "Categories" };

export default function CategoriesPage() {
  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold">Categories</h1>
      <p className="mb-8 text-slate-500">Browse all product categories on Nova</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SEED_CATEGORIES.map((cat) => (
          <Link
            key={cat.id}
            href={`/catalog?category=${cat.slug}`}
            className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-primary hover:shadow-soft dark:border-slate-800 dark:bg-slate-900"
          >
            <div>
              <h2 className="font-semibold text-slate-900 group-hover:text-primary dark:text-slate-100">{cat.name}</h2>
              <p className="mt-1 text-sm text-slate-500">{cat.productCount} products</p>
            </div>
            <ArrowRight size={18} className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-primary" />
          </Link>
        ))}
      </div>
    </div>
  );
}
