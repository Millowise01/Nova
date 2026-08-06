"use client";

import Link from "next/link";

import { Button, Card, EmptyState, ErrorState, Spinner } from "@nova/ui";
import { formatMoney } from "@nova/utils";

import { useCartQuery } from "@/features/cart/cart.queries";

export function CartScreen() {
  const query = useCartQuery();

  if (query.isLoading) {
    return (
      <div className="flex items-center justify-center gap-3 py-24 text-sm text-slate-600">
        <Spinner className="h-4 w-4" /> Loading your cart...
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <ErrorState
        action={<Button onClick={() => void query.refetch()}>Try again</Button>}
        description="We couldn't load your cart."
        title="Something went wrong"
      />
    );
  }

  const cart = query.data;

  if (cart.lines.length === 0) {
    return (
      <EmptyState
        action={
          <Link href="/catalog">
            <Button>Browse products</Button>
          </Link>
        }
        description="Add products from the catalog to get started."
        title="Your cart is empty"
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-8 md:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold">Shopping Cart</h1>

      <div className="space-y-3">
        {cart.lines.map((line) => (
          <Card className="flex items-center justify-between" key={line.id}>
            <div>
              {/* GET /cart/:id doesn't join to product/variant details (only
                  variantId), so there's no product title/image to show here —
                  a real backend limitation, not an oversight. */}
              <p className="text-sm font-semibold">Item {line.variantId.slice(0, 8)}</p>
              <p className="text-sm text-slate-600">Qty: {line.quantity}</p>
            </div>
            <p className="text-sm font-semibold">
              {formatMoney({
                amount: (Number(line.unitPriceAmount) * line.quantity).toFixed(2),
                currency: line.unitPriceCurrency,
              })}
            </p>
          </Card>
        ))}
      </div>

      <Card className="flex items-center justify-between">
        <p className="text-sm font-semibold">Subtotal</p>
        <p className="text-lg font-semibold">{formatMoney(cart.subtotal)}</p>
      </Card>

      <Link href="/checkout">
        <Button className="w-full">Proceed to Checkout</Button>
      </Link>
    </div>
  );
}
