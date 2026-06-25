import type { Metadata } from "next";
import { Star } from "lucide-react";
import { formatDate } from "@/lib/format";
import { StarRating } from "@/components/ui/StarRating";
import { SEED_PRODUCTS } from "@/lib/seed-data";

export const metadata: Metadata = { title: "My Reviews" };

const SEED_REVIEWS = [
  {
    id: "r-1",
    productId: "p-1",
    rating: 5,
    comment: "Amazing solar lantern! Lights the whole room and the USB port is super useful.",
    createdAt: "2025-05-15T10:00:00Z",
  },
  {
    id: "r-2",
    productId: "p-2",
    rating: 4,
    comment: "Great quality cocoa butter. Smells authentic and absorbs well. Will reorder.",
    createdAt: "2025-04-10T10:00:00Z",
  },
];

export default function ReviewsPage() {
  const reviewsWithProducts = SEED_REVIEWS.map((r) => ({
    ...r,
    product: SEED_PRODUCTS.find((p) => p.id === r.productId),
  }));

  return (
    <div className="space-y-6 py-6">
      <h1 className="text-2xl font-bold">My Reviews</h1>

      {reviewsWithProducts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-700">
          <Star size={36} className="mx-auto mb-3 text-slate-300" />
          <p className="font-medium">No reviews yet</p>
          <p className="mt-1 text-sm text-slate-500">Reviews you leave will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviewsWithProducts.map(({ id, rating, comment, createdAt, product }) => (
            <div
              key={id}
              className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start gap-4">
                {product?.images[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.images[0].url}
                    alt={product.name}
                    className="h-16 w-16 flex-shrink-0 rounded-xl object-cover"
                  />
                )}
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {product?.name ?? "Unknown Product"}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <StarRating rating={rating} size={13} />
                    <span className="text-xs text-slate-400">{formatDate(createdAt)}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{comment}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
