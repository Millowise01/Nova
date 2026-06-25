import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SearchBar } from "@/components/commerce/SearchBar";
import { ProductCard } from "@/components/commerce/ProductCard";
import { SEED_PRODUCTS, SEED_CATEGORIES } from "@/lib/seed-data";

export const metadata: Metadata = { title: "Home" };

export default function HomePage() {
  return (
    <div className="space-y-12">
      <div className="surface-gradient rounded-3xl px-6 py-10">
        <h1 className="mb-2 text-3xl font-bold">Good day 👋</h1>
        <p className="mb-6 text-slate-600 dark:text-slate-400">What are you looking for today?</p>
        <SearchBar />
      </div>

      <section>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold">Categories</h2>
          <Link href="/categories" className="text-sm text-primary hover:underline">See all</Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {SEED_CATEGORIES.map((cat) => (
            <Link key={cat.id} href={`/catalog?category=${cat.slug}`}
              className="flex-shrink-0 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium transition hover:border-primary hover:text-primary dark:border-slate-700 dark:bg-slate-900">
              {cat.name}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold">Trending Now</h2>
          <Link href="/catalog" className="flex items-center gap-1 text-sm text-primary hover:underline">View all <ArrowRight size={13} /></Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SEED_PRODUCTS.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold">🌱 Eco Picks</h2>
          <Link href="/eco-products" className="flex items-center gap-1 text-sm text-primary hover:underline">View all <ArrowRight size={13} /></Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SEED_PRODUCTS.filter((p) => p.isEcoCertified).slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>
    </div>
  );
}
