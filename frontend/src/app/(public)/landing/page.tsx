import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Leaf } from "lucide-react";
import { Hero } from "@/components/commerce/Hero";
import { ProductCard } from "@/components/commerce/ProductCard";
import { Badge } from "@/components/ui/Badge";
import { SEED_PRODUCTS, SEED_CATEGORIES, SEED_SELLERS } from "@/lib/seed-data";

export const metadata: Metadata = {
  title: "Nova — Sustainable Commerce in Sierra Leone",
  description: "Discover eco-certified products from verified local sellers. Fast delivery, transparent sourcing.",
};

export default function LandingPage() {
  const featured = SEED_PRODUCTS.filter((p) => p.isFeatured).slice(0, 4);
  const eco = SEED_PRODUCTS.filter((p) => p.isEcoCertified).slice(0, 4);

  return (
    <div className="space-y-16">
      <Hero />

      {/* Categories */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Shop by Category</h2>
          <Link href="/categories" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            All categories <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {SEED_CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/catalog?category=${cat.slug}`}
              className="group flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-center transition hover:border-primary hover:shadow-soft dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Leaf size={18} />
              </div>
              <p className="text-xs font-semibold text-slate-700 group-hover:text-primary dark:text-slate-300">{cat.name}</p>
              <p className="text-xs text-slate-400">{cat.productCount} items</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Featured Products</h2>
            <p className="mt-1 text-sm text-slate-500">Handpicked sustainable picks</p>
          </div>
          <Link href="/catalog" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* Eco banner */}
      <section className="surface-gradient rounded-3xl px-8 py-12">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div>
            <Badge variant="eco" className="mb-3">🌱 Sustainability First</Badge>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
              Every purchase tracked for eco impact
            </h2>
            <p className="mt-3 text-slate-700 dark:text-slate-300">
              Our eco-score system rates every product on carbon impact, packaging, and supply chain transparency.
            </p>
            <Link href="/eco-products" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90">
              Explore Eco Products <ArrowRight size={15} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {eco.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* Top sellers */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Top Sellers</h2>
          <p className="mt-1 text-sm text-slate-500">Verified local businesses you can trust</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SEED_SELLERS.map((seller) => (
            <Link
              key={seller.id}
              href={`/seller-storefront?id=${seller.id}`}
              className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:shadow-soft dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">
                {seller.shopName[0]}
              </div>
              <p className="font-semibold text-slate-900 dark:text-slate-100">{seller.shopName}</p>
              <p className="mt-1 line-clamp-2 text-xs text-slate-500">{seller.description}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-slate-500">{seller.totalSales.toLocaleString()} sales</span>
                {seller.isEcoCertified && <Badge variant="eco">Eco</Badge>}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
