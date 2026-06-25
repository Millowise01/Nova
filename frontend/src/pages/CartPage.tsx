import { Link } from 'react-router-dom';

import { AppShell } from '@/components/layout/AppShell';
import { Badge } from '@/components/ui/Badge';
import { PageState } from '@/components/ui/PageState';
import { useCartStore } from '@/store/cartStore';
import { formatNLE } from '@/utils/formatNLE';

export function CartPage() {
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.getSubtotal());
  const updateItemQuantity = useCartStore((state) => state.updateItemQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  return (
    <AppShell>
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Cart</h1>
            <p className="text-sm text-gray-600">Persisted locally and ready to sync to checkout and order placement.</p>
          </div>
          <Badge>{items.length} items</Badge>
        </div>

        {items.length === 0 ? (
          <PageState title="Your cart is empty" description="Add products from the search or product pages to continue." action={<Link to="/search" className="nova-button-primary">Browse products</Link>} />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.product.id} className="nova-card flex gap-4 p-4">
                  <img src={item.product.images[0]?.url} alt={item.product.name} className="h-24 w-24 rounded-lg object-cover" />
                  <div className="flex-1">
                    <h2 className="font-semibold text-gray-900">{item.product.name}</h2>
                    <p className="text-sm text-gray-600">{formatNLE(item.product.price)}</p>
                    <div className="mt-3 flex items-center gap-3">
                      <button type="button" onClick={() => updateItemQuantity(item.product.id, Math.max(1, item.quantity - 1))} className="nova-button-secondary px-3 py-1">-</button>
                      <span className="min-w-8 text-center font-semibold">{item.quantity}</span>
                      <button type="button" onClick={() => updateItemQuantity(item.product.id, item.quantity + 1)} className="nova-button-secondary px-3 py-1">+</button>
                      <button type="button" onClick={() => removeItem(item.product.id)} className="text-sm font-semibold text-red-600">Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside className="nova-card h-fit p-6">
              <h2 className="text-xl font-bold text-gray-900">Order summary</h2>
              <div className="mt-4 space-y-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">{formatNLE(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery fee</span>
                  <span className="font-semibold text-gray-900">Calculated at checkout</span>
                </div>
              </div>
              <Link to="/checkout" className="nova-button-primary mt-6 w-full">
                Continue to checkout
              </Link>
            </aside>
          </div>
        )}
      </section>
    </AppShell>
  );
}