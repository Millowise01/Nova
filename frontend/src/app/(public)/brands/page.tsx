import type { Metadata } from "next";
import Link from "next/link";
import { SEED_SELLERS } from "@/lib/seed-data";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = { title: "Brands" };

export default function BrandsPage() {
  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold">Brands</h1>
      <p className="mb-8 text-slate-500">Discover verified brands and sellers on Nova</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SEED_SELLERS.map((seller) => (
          <Link
            key={seller.id}
            href={`/seller-storefront?id=${seller.id}`}
            className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:shadow-soft dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-2xl font-bold text-primary">
              {seller.shopName[0]}
            </div>
            <h2 className="font-semibold text-slate-900 group-hover:text-primary dark:text-slate-100">{seller.shopName}</h2>
            <p className="mt-1 line-clamp-2 text-xs text-slate-500">{seller.description}</p>
            <div className="mt-3 flex items-center gap-2">
              {seller.isVerified && <Badge variant="success">Verified</Badge>}
              {seller.isEcoCertified && <Badge variant="eco">Eco</Badge>}
            </div>
            <p className="mt-2 text-xs text-slate-400">{seller.totalSales.toLocaleString()} total sales</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
