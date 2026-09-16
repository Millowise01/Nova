import { formatMoney } from "@nova/utils";
import type { ProductResponse } from "@nova/validation";

import type { Product } from "@/types/domain";

/** Maps the REAL backend product shape onto the legacy `Product` interface the
 *  existing home-page section components (ProductSection, RecommendationsSection,
 *  etc.) already render — so those components keep working unchanged, receiving
 *  real data as a prop exactly like they always have, rather than needing a
 *  rewrite. Fields the backend has no concept of (rating, reviewCount, images,
 *  sellerName, ecoScore) are honestly defaulted, not faked as if real. */
export function adaptProduct(product: ProductResponse): Product {
  const variant = product.variants[0];
  const money = variant
    ? { amount: variant.priceAmount, currency: variant.priceCurrency }
    : { amount: "0.00", currency: "SLE" as const };

  return {
    id: product.id as Product["id"],
    slug: product.slug,
    title: product.title,
    description: product.description ?? "",
    price: { ...money, formatted: formatMoney(money) },
    // No rating/review backend yet — 0 rather than a fabricated number.
    rating: 0,
    reviewCount: 0,
    // No image storage/CDN wired up yet.
    images: [],
    sellerId: product.sellerId as Product["sellerId"],
    // GET /products doesn't join to a seller name, only sellerId.
    sellerName: "Nova Seller",
    inStock: (variant?.stockQuantity ?? 0) > 0,
    // No eco-scoring backend yet.
    ecoScore: undefined,
    // The list endpoint returns categoryId, not a category name (no join) —
    // there's also no GET /categories to resolve it against.
    category: product.categoryId.slice(0, 8),
    tags: [],
  };
}
