import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

import { AppShell } from '@/components/layout/AppShell';
import { Badge } from '@/components/ui/Badge';
import { PageState } from '@/components/ui/PageState';
import { ProductCard } from '@/components/ui/ProductCard';
import { useIncrementProductViewMutation, useProductDetailQuery } from '@/hooks/useProducts';
import { formatNLE } from '@/utils/formatNLE';

export function ProductPage() {
  const params = useParams();
  const slug = params.slug ?? '';
  const productQuery = useProductDetailQuery(slug);
  const incrementViewMutation = useIncrementProductViewMutation();

  useEffect(() => {
    if (slug) {
      incrementViewMutation.mutate(slug);
    }
  }, [slug, incrementViewMutation]);

  const product = productQuery.data?.product;

  return (
    <AppShell>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/search" className="text-sm font-semibold text-brand-700">
            Back to search
          </Link>
          {product ? <Badge tone={product.isEcoCertified ? 'brand' : 'neutral'}>{product.isEcoCertified ? 'Eco certified' : 'Standard product'}</Badge> : null}
        </div>

        {productQuery.isLoading ? <PageState title="Loading product" description="Fetching product detail, seller info, and reviews." /> : null}
        {productQuery.isError ? <PageState title="Product unavailable" description="The product detail endpoint is wired but the backend is not live yet." /> : null}

        {product ? (
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <div className="nova-card overflow-hidden">
                {product.images[0] ? (
                  <img src={product.images[0].url} alt={product.images[0].alt ?? product.name} className="h-[420px] w-full object-cover" />
                ) : (
                  <div className="flex h-[420px] items-center justify-center bg-gray-100 text-gray-500">No product image</div>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {product.relatedProducts.slice(0, 2).map((related) => (
                  <ProductCard key={related.id} product={related} />
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="nova-card p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-700">{product.category.name}</p>
                <h1 className="mt-2 text-3xl font-black text-gray-900">{product.name}</h1>
                <p className="mt-3 text-lg text-gray-600">{product.description}</p>
                <div className="mt-5 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Price</p>
                    <p className="text-3xl font-black text-gray-900">{formatNLE(product.price)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Seller</p>
                    <p className="font-semibold text-gray-900">{product.seller.shopName}</p>
                    <p className="text-sm text-gray-600">{product.seller.rating.toFixed(1)} rating</p>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button type="button" className="nova-button-primary">Add to cart</button>
                  <button type="button" className="nova-button-secondary">Save to wishlist</button>
                </div>
              </div>

              <div className="nova-card p-6">
                <h2 className="text-xl font-bold text-gray-900">Reviews</h2>
                <p className="mt-2 text-sm text-gray-600">Paginated review data will come from the backend reviews endpoint.</p>
                <div className="mt-4 space-y-3">
                  {productQuery.data?.reviews.data.map((review) => (
                    <div key={review.id} className="rounded-lg border border-gray-200 p-4">
                      <p className="font-semibold text-gray-900">{review.author.name}</p>
                      <p className="text-sm text-gray-600">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </AppShell>
  );
}