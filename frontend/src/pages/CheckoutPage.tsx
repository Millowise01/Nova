import { Link } from 'react-router-dom';

import { AppShell } from '@/components/layout/AppShell';
import { PageState } from '@/components/ui/PageState';
import { useAddressesQuery } from '@/hooks/useUsers';
import { useCartStore } from '@/store/cartStore';
import { formatNLE } from '@/utils/formatNLE';

export function CheckoutPage() {
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.getSubtotal());
  const addressesQuery = useAddressesQuery();

  if (items.length === 0) {
    return (
      <AppShell>
        <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <PageState title="Checkout needs a cart" description="Add items before you can place an order." action={<Link to="/search" className="nova-button-primary">Shop now</Link>} />
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="nova-card p-6">
              <h1 className="text-3xl font-black text-gray-900">Checkout</h1>
              <p className="mt-2 text-sm text-gray-600">This page is already laid out for address, payment, and order confirmation steps.</p>
            </div>

            <div className="nova-card p-6">
              <h2 className="text-xl font-bold text-gray-900">Delivery address</h2>
              {addressesQuery.isLoading ? <p className="mt-4 text-sm text-gray-500">Loading addresses...</p> : null}
              {addressesQuery.isError ? <p className="mt-4 text-sm text-red-600">Address data is not available yet.</p> : null}
              {addressesQuery.data?.map((address) => (
                <label key={address.id} className="mt-4 flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-4">
                  <input type="radio" name="address" className="mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">{address.label}</p>
                    <p className="text-sm text-gray-600">{address.line1}</p>
                    <p className="text-sm text-gray-600">{address.city}, {address.country}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="nova-card p-6">
              <h2 className="text-xl font-bold text-gray-900">Payment method</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {['CARD', 'ORANGE_MONEY', 'AFRICELL_MONEY'].map((method) => (
                  <label key={method} className="flex items-center gap-3 rounded-lg border border-gray-200 p-4">
                    <input type="radio" name="paymentMethod" />
                    <span className="text-sm font-semibold text-gray-900">{method.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <aside className="nova-card h-fit p-6">
            <h2 className="text-xl font-bold text-gray-900">Order summary</h2>
            <div className="mt-4 space-y-3 text-sm text-gray-600">
              <div className="flex justify-between"><span>Subtotal</span><span className="font-semibold text-gray-900">{formatNLE(subtotal)}</span></div>
              <div className="flex justify-between"><span>Delivery fee</span><span className="font-semibold text-gray-900">Calculated by backend</span></div>
              <div className="flex justify-between border-t border-gray-200 pt-3"><span>Total</span><span className="font-black text-gray-900">Pending API</span></div>
            </div>
            <button type="button" className="nova-button-primary mt-6 w-full">Place order</button>
          </aside>
        </div>
      </section>
    </AppShell>
  );
}