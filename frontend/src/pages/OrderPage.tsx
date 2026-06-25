import { Link, useParams } from 'react-router-dom';

import { AppShell } from '@/components/layout/AppShell';
import { PageState } from '@/components/ui/PageState';
import { useOrderQuery } from '@/hooks/useOrders';
import { formatNLE } from '@/utils/formatNLE';

export function OrderPage() {
  const params = useParams();
  const orderId = params.id ?? '';
  const orderQuery = useOrderQuery(orderId);

  return (
    <AppShell>
      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <Link to="/profile" className="text-sm font-semibold text-brand-700">Back to profile</Link>
        <div className="mt-4">
          {orderQuery.isLoading ? <PageState title="Loading order" description="Fetching current status and line items." /> : null}
          {orderQuery.isError ? <PageState title="Order unavailable" description="The order detail endpoint is wired but not live yet." /> : null}
          {orderQuery.data ? (
            <div className="nova-card p-6">
              <h1 className="text-3xl font-black text-gray-900">Order {orderQuery.data.id}</h1>
              <p className="mt-2 text-gray-600">Status: {orderQuery.data.status}</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg bg-gray-50 p-4"><p className="text-sm text-gray-500">Subtotal</p><p className="font-bold">{formatNLE(orderQuery.data.subtotal)}</p></div>
                <div className="rounded-lg bg-gray-50 p-4"><p className="text-sm text-gray-500">Delivery</p><p className="font-bold">{formatNLE(orderQuery.data.deliveryFee)}</p></div>
                <div className="rounded-lg bg-gray-50 p-4"><p className="text-sm text-gray-500">Total</p><p className="font-bold">{formatNLE(orderQuery.data.total)}</p></div>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </AppShell>
  );
}