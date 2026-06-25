import { AppShell } from '@/components/layout/AppShell';
import { ErrorCard, LoadingCard } from '@/components/ui/StateCards';
import { useAdminSellersQuery, useEcoCertifySellerMutation, useVerifySellerMutation } from '@/hooks/useAdmin';

export function AdminSellersPage() {
  const sellersQuery = useAdminSellersQuery();
  const verifyMutation = useVerifySellerMutation();
  const ecoCertifyMutation = useEcoCertifySellerMutation();

  return (
    <AppShell>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="nova-card p-6">
          <h1 className="text-3xl font-black text-gray-900">Admin sellers</h1>
          <p className="mt-1 text-sm text-gray-600">Approve seller accounts and grant eco certification from the admin API shape.</p>
        </div>

        <div className="mt-6 space-y-4">
          {sellersQuery.isLoading ? <LoadingCard label="Loading sellers" /> : null}
          {sellersQuery.isError ? <ErrorCard title="Sellers unavailable" message="The admin sellers endpoint is wired but not live yet." /> : null}
          {sellersQuery.data ? (
            sellersQuery.data.map((seller) => (
              <div key={seller.id} className="nova-card p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{seller.shopName}</h2>
                    <p className="text-sm text-gray-600">{seller.shopDescription ?? 'No description provided.'}</p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => verifyMutation.mutate(seller.id)} className="nova-button-secondary">
                      Verify seller
                    </button>
                    <button type="button" onClick={() => ecoCertifyMutation.mutate(seller.id)} className="nova-button-secondary">
                      Grant eco cert
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : null}
        </div>
      </section>
    </AppShell>
  );
}