import type { Metadata } from "next";
import { ShieldCheck, Star } from "lucide-react";
import { ProductCard } from "@/components/commerce/ProductCard";
import { Badge } from "@/components/ui/Badge";
import { EcoScorePill } from "@/components/ui/EcoScorePill";
import { SEED_SELLERS, SEED_PRODUCTS } from "@/lib/seed-data";

export const metadata: Metadata = { title: "Seller Storefront" };

interface Props { searchParams: Promise<{ id?: string }> }

export default async function SellerStorefrontPage({ searchParams }: Props) {
  const { id } = await searchParams;
  const seller = id ? SEED_SELLERS.find((s) => s.id === id) : SEED_SELLERS[0];
  const displayed = seller ?? SEED_SELLERS[0]!;
  const sellerProducts = SEED_PRODUCTS.filter((p) => p.seller.id === displayed.id);

  return (
    <div className="space-y-8">
      {/* Shop header */}
      <div className="surface-gradient rounded-3xl p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-3xl font-bold text-primary">
            {displayed.shopName[0]}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold">{displayed.shopName}</h1>
              {displayed.isVerified && <Badge variant="success"><ShieldCheck size={11} className="mr-1" />Verified</Badge>}
              {displayed.isEcoCertified && <EcoScorePill score={90} certified />}
            </div>
            <p className="mt-1 text-slate-600 dark:text-slate-300">{displayed.description}</p>
            <div className="mt-3 flex flex-wrap gap-4 text-sm">
              <span className="flex items-center gap-1 text-slate-500"><Star size={14} className="text-secondary" />{displayed.rating.toFixed(1)} rating</span>
              <span className="text-slate-500">{displayed.totalSales.toLocaleString()} total sales</span>
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      {sellerProducts.length > 0 ? (
        <section>
          <h2 className="mb-5 text-xl font-bold">Products from {displayed.shopName}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {sellerProducts.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-700">
          <p className="font-medium">No products listed yet</p>
        </div>
      )}

      {/* All sellers */}
      <section>
        <h2 className="mb-5 text-xl font-bold">Explore Other Sellers</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SEED_SELLERS.filter((s) => s.id !== displayed.id).map((s) => (
            <a key={s.id} href={`/seller-storefront?id=${s.id}`}
              className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:shadow-soft dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 font-bold text-primary">{s.shopName[0]}</div>
              <p className="font-semibold">{s.shopName}</p>
              <p className="mt-1 text-xs text-slate-500">{s.totalSales.toLocaleString()} sales</p>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
