import { AppShell } from '@/components/layout/AppShell';
import { ErrorCard, LoadingCard } from '@/components/ui/StateCards';
import { useAdminOrdersQuery } from '@/hooks/useAdmin';
import { formatNLE } from '@/utils/formatNLE';

export function AdminOrdersPage() {
  const ordersQuery = useAdminOrdersQuery();

  return (
    <AppShell>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="nova-card p-6">
          <h1 className="text-3xl font-black text-gray-900">Admin orders</h1>
          <p className="mt-1 text-sm text-gray-600">Global order oversight powered by the future admin endpoint.</p>
        </div>
        <div className="mt-6 space-y-4">
          {ordersQuery.isLoading ? <LoadingCard label="Loading admin orders" /> : null}
          {ordersQuery.isError ? <ErrorCard title="Admin orders unavailable" message="The admin orders endpoint is wired but not live yet." /> : null}
          {ordersQuery.data ? (
            ordersQuery.data.map((order) => (
              <div key={order.id} className="nova-card p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-gray-500">Order {order.id}</p>
                    <h2 className="text-xl font-bold text-gray-900">{order.status}</h2>
                  </div>
                  <p className="text-lg font-black text-gray-900">{formatNLE(order.total)}</p>
                </div>
              </div>
            ))
          ) : null}
        </div>
      </section>
    </AppShell>
  );
}