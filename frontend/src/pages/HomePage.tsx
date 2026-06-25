import { AppShell } from '@/components/layout/AppShell';
import { Badge } from '@/components/ui/Badge';
import { PageState } from '@/components/ui/PageState';
import { ProductCard } from '@/components/ui/ProductCard';
import { useHomeFeedQuery } from '@/hooks/useProducts';

export function HomePage() {
  const homeFeedQuery = useHomeFeedQuery();

  return (
    <AppShell>
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="nova-card p-8">
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone="brand">Frontend shell</Badge>
              <Badge tone="accent">API-shaped data layer</Badge>
            </div>
            <h1 className="mt-4 text-3xl font-black text-gray-900 sm:text-4xl">Home</h1>
            <p className="mt-2 max-w-2xl text-gray-600">This page is already wired to the future home feed endpoint, so the backend can drop in later without changing the UI contract.</p>
          </div>

          {homeFeedQuery.isLoading ? <PageState title="Loading home feed" description="Fetching categories, banners, sellers, and eco picks." /> : null}
          {homeFeedQuery.isError ? <PageState title="Home feed unavailable" description="The frontend is ready, but the backend feed has not been implemented yet." /> : null}

          {homeFeedQuery.data ? (
            <div className="space-y-8">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {[
                  ['Featured sellers', homeFeedQuery.data.featuredSellers.length],
                  ['Eco picks', homeFeedQuery.data.ecoProducts.length],
                  ['Featured products', homeFeedQuery.data.featuredProducts.length],
                  ['Categories', homeFeedQuery.data.categories.length],
                ].map(([label, value]) => (
                  <div key={label} className="nova-card p-5">
                    <p className="text-sm text-gray-500">{label}</p>
                    <p className="mt-2 text-3xl font-black text-gray-900">{value as number}</p>
                  </div>
                ))}
              </div>

              <section>
                <div className="mb-4 flex items-end justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Featured products</h2>
                  <Badge>Real API contract</Badge>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {homeFeedQuery.data.featuredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            </div>
          ) : null}
        </div>
      </section>
    </AppShell>
  );
}