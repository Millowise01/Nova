import { useState } from 'react';

import { AppShell } from '@/components/layout/AppShell';
import { Badge } from '@/components/ui/Badge';
import { ErrorCard, LoadingCard } from '@/components/ui/StateCards';
import { useSellerProductsQuery } from '@/hooks/useSeller';
import { formatNLE } from '@/utils/formatNLE';

export function SellerProductsPage() {
  const [page, setPage] = useState(1);
  const productsQuery = useSellerProductsQuery(page, 12);

  return (
    <AppShell>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="nova-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-black text-gray-900">Seller products</h1>
              <p className="mt-1 text-sm text-gray-600">Real list, pagination, and price formatting against the future seller endpoint.</p>
            </div>
            <Badge tone="brand">Page {page}</Badge>
          </div>
        </div>

        <div className="mt-6">
          {productsQuery.isLoading ? <LoadingCard label="Loading seller products" /> : null}
          {productsQuery.isError ? <ErrorCard title="Seller products unavailable" message="The seller products endpoint is wired but not live yet." /> : null}
          {productsQuery.data ? (
            <div className="nova-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 text-left text-sm text-gray-500">
                    <tr>
                      <th className="px-6 py-4">Product</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Price</th>
                      <th className="px-6 py-4">Stock</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white text-sm text-gray-700">
                    {productsQuery.data.data.map((product) => (
                      <tr key={product.id}>
                        <td className="px-6 py-4 font-semibold text-gray-900">{product.name}</td>
                        <td className="px-6 py-4">{product.category?.name ?? 'Uncategorized'}</td>
                        <td className="px-6 py-4">{formatNLE(product.price)}</td>
                        <td className="px-6 py-4">{product.stock}</td>
                        <td className="px-6 py-4">{product.isActive ? 'Active' : 'Paused'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4 text-sm text-gray-600">
                <span>
                  Page {productsQuery.data.meta.page} of {productsQuery.data.meta.totalPages}
                </span>
                <div className="flex gap-2">
                  <button type="button" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="nova-button-secondary disabled:opacity-50">
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={page >= productsQuery.data.meta.totalPages}
                    onClick={() => setPage((value) => value + 1)}
                    className="nova-button-secondary disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </AppShell>
  );
}