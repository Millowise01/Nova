import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Truck } from "lucide-react";
import { SEED_PRODUCTS } from "@/lib/seed-data";
import { formatSll } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { EcoScorePill } from "@/components/ui/EcoScorePill";
import { StarRating } from "@/components/ui/StarRating";
import { ProductCard } from "@/components/commerce/ProductCard";
import { AddToCartButton } from "@/components/commerce/AddToCartButton";

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = SEED_PRODUCTS.find((p) => p.slug === slug);
  if (!product) return { title: "Product Not Found" };
  return { title: product.name, description: product.description };
}

export async function generateStaticParams() {
  return SEED_PRODUCTS.map((p) => ({ slug: p.slug }));
}

export default async function ProductDetailsPage({ params }: Props) {
  const { slug } = await params;
  const product = SEED_PRODUCTS.find((p) => p.slug === slug);
  if (!product) notFound();

  const related = SEED_PRODUCTS.filter((p) => p.id !== product.id && p.category.id === product.category.id).slice(0, 4);
  const image = product.images[0];

  return (
    <div className="space-y-12">
      <div>
        <Link href="/catalog" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-primary">
          <ArrowLeft size={14} /> Back to catalog
        </Link>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Images */}
          <div className="space-y-3">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100">
              {image ? (
                <Image src={image.url} alt={image.alt ?? product.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" priority />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-400">No image</div>
              )}
              {product.isEcoCertified && (
                <div className="absolute left-3 top-3"><EcoScorePill score={product.ecoScore} certified /></div>
              )}
            </div>
            <div className="flex gap-2">
              {product.images.slice(1, 4).map((img) => (
                <div key={img.id} className="relative h-20 w-20 overflow-hidden rounded-xl border border-slate-200">
                  <Image src={img.url} alt={img.alt ?? product.name} fill className="object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="space-y-5">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Badge variant="default">{product.category.name}</Badge>
                {product.carbonImpact === "LOW" && <Badge variant="eco">Low Carbon</Badge>}
              </div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{product.name}</h1>
              <p className="mt-1 text-sm text-slate-500">Sold by <Link href={`/seller-storefront?id=${product.seller.id}`} className="text-primary hover:underline">{product.seller.shopName}</Link></p>
            </div>

            {product.rating !== undefined && (
              <div className="flex items-center gap-3">
                <StarRating rating={product.rating} />
                <span className="text-sm text-slate-500">({product.reviewCount} reviews)</span>
              </div>
            )}

            <div className="flex items-end gap-3">
              <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">{formatSll(product.priceSll)}</span>
              {product.stock < 10 && <span className="mb-1 text-sm text-warning">Only {product.stock} left</span>}
            </div>

            <p className="text-slate-600 dark:text-slate-400">{product.description}</p>

            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">#{tag}</span>
              ))}
            </div>

            <div className="space-y-2 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
              <div className="flex items-center gap-2 text-sm"><Truck size={15} className="text-primary" /><span>Free delivery on orders over SLL 500K</span></div>
              <div className="flex items-center gap-2 text-sm"><ShieldCheck size={15} className="text-primary" /><span>30-day return policy</span></div>
              {product.seller.isVerified && (
                <div className="flex items-center gap-2 text-sm"><ShieldCheck size={15} className="text-success" /><span>Verified seller</span></div>
              )}
            </div>

            <AddToCartButton product={product} />
          </div>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section>
          <h2 className="mb-5 text-xl font-bold">Related Products</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
