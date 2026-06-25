import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { AppShell } from '@/components/layout/AppShell';
import { ErrorCard, LoadingCard } from '@/components/ui/StateCards';
import { PageState } from '@/components/ui/PageState';
import { usePlaceOrderMutation } from '@/hooks/useOrders';
import { useAddressesQuery } from '@/hooks/useUsers';
import { useCartStore } from '@/store/cartStore';
import { formatNLE } from '@/utils/formatNLE';

export function CheckoutPage() {
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.getSubtotal());
  const clearCart = useCartStore((state) => state.clearCart);
  const addressesQuery = useAddressesQuery();
  const placeOrderMutation = usePlaceOrderMutation();
  const navigate = useNavigate();

  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'ORANGE_MONEY' | 'AFRICELL_MONEY' | 'CARD'>('CARD');
  const [notes, setNotes] = useState('');
  const [what3words, setWhat3words] = useState('');

  const deliveryFee = useMemo(() => {
    const baseFee = 150000;
    const perItemFee = items.reduce((sum, item) => sum + item.quantity * 25000, 0);
    return baseFee + perItemFee;
  }, [items]);

  const total = subtotal + deliveryFee;

  useEffect(() => {
    if (!selectedAddressId && addressesQuery.data?.length) {
      setSelectedAddressId(addressesQuery.data[0].id);
    }
  }, [addressesQuery.data, selectedAddressId]);

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
              <p className="mt-2 text-sm text-gray-600">This flow is wired to the future order API and validates the cart, delivery address, and payment method before submit.</p>
            </div>

            <div className="nova-card p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-bold text-gray-900">Delivery address</h2>
                {addressesQuery.isLoading ? <span className="text-sm text-gray-500">Loading...</span> : null}
              </div>
              {addressesQuery.isError ? (
                <div className="mt-4">
                  <ErrorCard title="Address data is not available yet" message="The checkout page is ready for the backend addresses endpoint." />
                </div>
              ) : null}
              <div className="mt-4 space-y-3">
                {addressesQuery.data?.map((address) => (
                  <label
                    key={address.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${selectedAddressId === address.id ? 'border-brand-500 bg-brand-50' : 'border-gray-200 bg-white'}`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddressId === address.id}
                      onChange={() => setSelectedAddressId(address.id)}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">{address.label}</p>
                      <p className="text-sm text-gray-600">{address.line1}</p>
                      <p className="text-sm text-gray-600">
                        {address.city}, {address.country}
                      </p>
                      {address.what3words ? <p className="text-xs text-gray-500">{address.what3words}</p> : null}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="nova-card p-6">
              <h2 className="text-xl font-bold text-gray-900">Payment method</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {['CARD', 'ORANGE_MONEY', 'AFRICELL_MONEY'].map((method) => (
                  <label key={method} className={`flex items-center gap-3 rounded-lg border p-4 ${paymentMethod === method ? 'border-brand-500 bg-brand-50' : 'border-gray-200'}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === method}
                      onChange={() => setPaymentMethod(method as 'CARD' | 'ORANGE_MONEY' | 'AFRICELL_MONEY')}
                    />
                    <span className="text-sm font-semibold text-gray-900">{method.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="nova-card p-6">
              <h2 className="text-xl font-bold text-gray-900">Order notes</h2>
              <div className="mt-4 grid gap-4">
                <label className="space-y-2 text-sm font-medium text-gray-700">
                  <span>Notes for delivery</span>
                  <textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    rows={4}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none ring-brand-500 focus:ring-2"
                    placeholder="Add a gate code, landmark, or delivery instructions"
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-gray-700">
                  <span>What3words</span>
                  <input
                    value={what3words}
                    onChange={(event) => setWhat3words(event.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none ring-brand-500 focus:ring-2"
                    placeholder="///sample.location.here"
                  />
                </label>
              </div>
            </div>
          </div>

          <aside className="nova-card h-fit p-6">
            <h2 className="text-xl font-bold text-gray-900">Order summary</h2>
            <div className="mt-4 space-y-3 text-sm text-gray-600">
              <div className="flex justify-between"><span>Subtotal</span><span className="font-semibold text-gray-900">{formatNLE(subtotal)}</span></div>
              <div className="flex justify-between"><span>Delivery fee</span><span className="font-semibold text-gray-900">{formatNLE(deliveryFee)}</span></div>
              <div className="flex justify-between border-t border-gray-200 pt-3"><span>Total</span><span className="font-black text-gray-900">{formatNLE(total)}</span></div>
            </div>
            {placeOrderMutation.isError ? (
              <div className="mt-4">
                <ErrorCard title="Order submission failed" message="The checkout mutation is wired, but the backend endpoint returned an error or is not available yet." />
              </div>
            ) : null}
            <button
              type="button"
              disabled={!selectedAddressId || placeOrderMutation.isPending}
              onClick={() => {
                if (!selectedAddressId) {
                  toast.error('Select a delivery address first.');
                  return;
                }

                placeOrderMutation.mutate(
                  {
                    addressId: selectedAddressId,
                    paymentMethod,
                    notes: notes || undefined,
                    what3words: what3words || undefined,
                    items: items.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
                  },
                  {
                    onSuccess: (order) => {
                      clearCart();
                      toast.success('Order placed successfully.');
                      navigate(`/order/${order.id}`);
                    },
                  },
                );
              }}
              className="nova-button-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-60"
            >
              {placeOrderMutation.isPending ? 'Placing order...' : 'Place order'}
            </button>
          </aside>
        </div>
      </section>
    </AppShell>
  );
}