import { Link } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { PageState } from '@/components/ui/PageState';
import { ProductCard } from '@/components/ui/ProductCard';
import { useCategoriesQuery, useFeaturedProductsQuery } from '@/hooks/useProducts';

const highlights = [
  'Built for Sierra Leone commerce',
  'Customer, seller, and admin flows',
  'Ready for real API integration',
];

export function LandingPage() {
  const featuredProductsQuery = useFeaturedProductsQuery();
  const categoriesQuery = useCategoriesQuery();

  return (
    <AppShell>
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-24">
        <div className="space-y-8">
          <span className="inline-flex rounded-full bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700">
            Nova e-commerce platform
          </span>
          <div className="space-y-4">
            <h1 className="max-w-2xl text-4xl font-black tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              A split frontend first scaffold for Nova.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-gray-600">
              This workspace now has a dedicated React frontend package and a separate backend package, so the UI can be built and iterated on independently before the API layer is completed.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/register" className="nova-button-primary">
              Start with frontend
            </Link>
            <Link to="/home" className="nova-button-secondary">
              View app shell
            </Link>
          </div>
          <ul className="grid gap-3 sm:grid-cols-3">
            {highlights.map((item) => (
              <li key={item} className="nova-card p-4 text-sm font-medium text-gray-700">
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="nova-card overflow-hidden p-6">
          <div className="rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 p-6 text-white shadow-soft">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-50">Workspace split</p>
            <div className="mt-6 space-y-4">
              <div className="rounded-xl bg-white/10 p-4">
                <p className="text-sm opacity-80">Frontend</p>
                <p className="text-lg font-bold">React + Vite + Zustand + Query</p>
              </div>
              <div className="rounded-xl bg-white/10 p-4">
                <p className="text-sm opacity-80">Backend</p>
                <p className="text-lg font-bold">Reserved for Express + Prisma</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
          <div className="nova-card p-6">
            <h2 className="text-xl font-bold text-gray-900">Categories from the future API</h2>
            <p className="mt-2 text-sm text-gray-600">These are wired through TanStack Query and will hydrate from the backend later.</p>
            <div className="mt-5 space-y-3">
              {categoriesQuery.isLoading ? <p className="text-sm text-gray-500">Loading categories...</p> : null}
              {categoriesQuery.isError ? <PageState title="Categories unavailable" description="The API contract is wired, but the backend is not live yet." /> : null}
              {categoriesQuery.data?.map((category) => (
                <div key={category.id} className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
                  <div>
                    <p className="font-semibold text-gray-900">{category.name}</p>
                    <p className="text-sm text-gray-600">{category.description ?? 'Category data will be supplied by the backend.'}</p>
                  </div>
                  <span className="text-sm font-semibold text-brand-700">{category.productCount ?? 0} items</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Featured products</h2>
                <p className="text-sm text-gray-600">Consumed directly from the future /products/featured endpoint.</p>
              </div>
              <Link to="/search" className="text-sm font-semibold text-brand-700">
                Browse all
              </Link>
            </div>
            {featuredProductsQuery.isLoading ? <PageState title="Loading products" description="Waiting for the backend contract." /> : null}
            {featuredProductsQuery.isError ? <PageState title="Featured products unavailable" description="The API is wired but not yet running." /> : null}
            {featuredProductsQuery.data ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {featuredProductsQuery.data.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </AppShell>
  );
}