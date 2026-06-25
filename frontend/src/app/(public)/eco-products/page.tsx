import type { Metadata } from "next";
import Link from "next/link";
import { Leaf } from "lucide-react";
import { ProductCard } from "@/components/commerce/ProductCard";
import { Badge } from "@/components/ui/Badge";
import { SEED_PRODUCTS } from "@/lib/seed-data";

export const metadata: Metadata = {
  title: "Eco Products",
  description: "Shop eco-certified sustainable products with verified low-carbon supply chains.",
};

export default function EcoProductsPage() {
  const ecoProducts = SEED_PRODUCTS.filter((p) => p.isEcoCertified);
  const highScore = ecoProducts.filter((p) => p.ecoScore >= 90);

  return (
    <div className="space-y-10">
      <div className="surface-gradient rounded-3xl px-8 py-12">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Leaf size={24} className="text-primary" />
          </div>
          <div>
            <Badge variant="eco" className="mb-1">Eco Certified</Badge>
            <h1 className="text-3xl font-bold">Eco Products</h1>
          </div>
        </div>
        <p className="mt-3 max-w-xl text-slate-600 dark:text-slate-300">
          Every product here is verified for low carbon impact, responsible packaging, and ethical sourcing.
        </p>
        <div className="mt-6 grid grid-cols-3 gap-4 sm:w-96">
          {[{ label: "Eco Score", value: "85+" }, { label: "CO₂ Saved", value: "2.4t" }, { label: "Verified Products", value: `${ecoProducts.length}` }].map((s) => (
            <div key={s.label} className="rounded-xl bg-white/70 p-3 text-center dark:bg-slate-900/50">
              <p className="text-xl font-bold text-primary">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {highScore.length > 0 && (
        <section>
          <h2 className="mb-5 flex items-center gap-2 text-xl font-bold">
            <Leaf size={18} className="text-primary" /> Top Eco Score (90+)
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {highScore.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-5 text-xl font-bold">All Eco Products</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ecoProducts.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      <div className="rounded-2xl bg-primary/5 p-6 text-center">
        <p className="font-semibold text-slate-900 dark:text-slate-100">Want to list eco products?</p>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Get your shop Nova eco-certified and reach sustainability-conscious buyers.</p>
        <Link href="/seller/register" className="mt-4 inline-flex rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90">
          Become a Seller
        </Link>
      </div>
    </div>
  );
}
