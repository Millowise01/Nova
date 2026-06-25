import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { AppShell } from '@/components/layout/AppShell';
import { PageState } from '@/components/ui/PageState';
import { ProductCard } from '@/components/ui/ProductCard';
import { useCategoriesQuery, useProductListQuery } from '@/hooks/useProducts';

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParams = useMemo(
    () => ({
      search: searchParams.get('q') ?? '',
      category: searchParams.get('category') ?? undefined,
      eco: searchParams.get('eco') === 'true' ? true : undefined,
      sort: (searchParams.get('sort') as 'newest' | 'price_asc' | 'price_desc' | 'top_rated' | null) ?? undefined,
      page: Number(searchParams.get('page') ?? 1),
      limit: 12,
    }),
    [searchParams],
  );

  const productsQuery = useProductListQuery(queryParams);
  const categoriesQuery = useCategoriesQuery();

  function setFilter(name: string, value: string) {
    const next = new URLSearchParams(searchParams);

    if (value) {
      next.set(name, value);
    } else {
      next.delete(name);
    }

    setSearchParams(next);
  }

  return (
    <AppShell>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="nova-card p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-black text-gray-900">Search</h1>
              <p className="mt-1 text-gray-600">URL-driven filters already match the future products endpoint.</p>
            </div>
            <Link to="/home" className="text-sm font-semibold text-brand-700">
              Back to home
            </Link>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <label className="sr-only" htmlFor="search-query">
              Search products
            </label>
            <input
              id="search-query"
              value={searchParams.get('q') ?? ''}
              onChange={(event) => setFilter('q', event.target.value)}
              placeholder="Search products"
              className="rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-brand-500"
            />
            <label className="sr-only" htmlFor="search-category">
              Filter by category
            </label>
            <select id="search-category" value={searchParams.get('category') ?? ''} onChange={(event) => setFilter('category', event.target.value)} className="rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-brand-500">
              <option value="">All categories</option>
              {categoriesQuery.data?.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
            <label className="sr-only" htmlFor="search-sort">
              Sort products
            </label>
            <select id="search-sort" value={searchParams.get('sort') ?? ''} onChange={(event) => setFilter('sort', event.target.value)} className="rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-brand-500">
              <option value="">Sort by</option>
              <option value="newest">Newest</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
              <option value="top_rated">Top rated</option>
            </select>
            <button type="button" onClick={() => setFilter('eco', searchParams.get('eco') === 'true' ? '' : 'true')} className="nova-button-secondary">
              {searchParams.get('eco') === 'true' ? 'Eco only' : 'Show eco only'}
            </button>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          {productsQuery.isLoading ? <PageState title="Searching products" description="Fetching results from the future API shape." /> : null}
          {productsQuery.isError ? <PageState title="Search unavailable" description="The products query is wired, but the backend is not running yet." /> : null}
          {productsQuery.data ? (
            <>
              <p className="text-sm text-gray-600">{productsQuery.data.meta.total} results</p>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {productsQuery.data.data.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          ) : null}
        </div>
      </section>
    </AppShell>
  );
}