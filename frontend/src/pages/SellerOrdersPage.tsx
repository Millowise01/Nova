import { useState } from 'react';

import { AppShell } from '@/components/layout/AppShell';
import { Badge } from '@/components/ui/Badge';
import { ErrorCard, LoadingCard } from '@/components/ui/StateCards';
import { useSellerOrdersQuery } from '@/hooks/useSeller';
import { formatNLE } from '@/utils/formatNLE';

const statuses = ['all', 'PLACED', 'CONFIRMED', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'] as const;

export function SellerOrdersPage() {
  const [status, setStatus] = useState<(typeof statuses)[number]>('all');
  const ordersQuery = useSellerOrdersQuery(status === 'all' ? undefined : status);

  return (
    <AppShell>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="nova-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-black text-gray-900">Seller orders</h1>
              <p className="mt-1 text-sm text-gray-600">Filter and process incoming orders from the future API contract.</p>
            </div>
            <Badge tone="accent">{status}</Badge>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {statuses.map((value) => (
              <button key={value} type="button" onClick={() => setStatus(value)} className={value === status ? 'nova-button-primary' : 'nova-button-secondary'}>
                {value}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          {ordersQuery.isLoading ? <LoadingCard label="Loading seller orders" /> : null}
          {ordersQuery.isError ? <ErrorCard title="Seller orders unavailable" message="The seller orders endpoint is wired but not live yet." /> : null}
          {ordersQuery.data ? (
            <div className="space-y-4">
              {ordersQuery.data.map((order) => (
                <div key={order.id} className="nova-card p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-gray-500">Order {order.id}</p>
                      <h2 className="text-xl font-bold text-gray-900">{order.status}</h2>
                    </div>
                    <p className="text-lg font-black text-gray-900">{formatNLE(order.total)}</p>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3 text-sm text-gray-600">
                    <div>
                      <p className="font-semibold text-gray-900">Payment</p>
                      <p>{order.paymentMethod}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Status</p>
                      <p>{order.paymentStatus}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Items</p>
                      <p>{order.items.length}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </AppShell>
  );
}