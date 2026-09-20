"use client";

import Link from "next/link";

import { Image as ImageIcon } from "@nova/icons";
import { Button, Card, EmptyState, ErrorState, Spinner } from "@nova/ui";
import { formatMoney } from "@nova/utils";

import { useCartQuery } from "@/features/cart/cart.queries";

export function CartScreen() {
  const query = useCartQuery();

  if (query.isLoading) {
    return (
      <div className="flex items-center justify-center gap-3 py-24 text-sm text-[color:var(--color-foreground-muted)]">
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
          <Link href="/categories">
            <Button>Browse products</Button>
          </Link>
        }
        description="Add products from the catalog to get started."
        title="Your cart is empty"
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6 lg:px-8">
      <h1 className="mb-6 text-3xl font-bold tracking-tight text-[color:var(--color-foreground)]">
        Shopping Cart
      </h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Line items */}
        <div className="space-y-3">
          {cart.lines.map((line) => (
            <Card key={line.id} className="flex items-center gap-4 rounded-xl p-4">
              {/* Image placeholder */}
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[color:var(--color-muted)] text-[color:var(--color-foreground-subtle)]">
                <ImageIcon aria-hidden="true" size={24} strokeWidth={1.5} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[color:var(--color-foreground)]">
                  Item {line.variantId.slice(0, 8)}
                </p>
                <p className="text-xs text-[color:var(--color-foreground-muted)]">
                  Qty: {line.quantity}
                </p>
              </div>

              <p className="shrink-0 text-sm font-bold text-[color:var(--color-foreground)]">
                {formatMoney({
                  amount: (Number(line.unitPriceAmount) * line.quantity).toFixed(2),
                  currency: line.unitPriceCurrency,
                })}
              </p>
            </Card>
          ))}
        </div>

        {/* Order summary */}
        <Card className="h-fit rounded-xl p-6 lg:sticky lg:top-24">
          <h2 className="mb-4 text-base font-bold text-[color:var(--color-foreground)]">
            Order Summary
          </h2>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-[color:var(--color-foreground-muted)]">
              <span>Subtotal</span>
              <span className="font-semibold text-[color:var(--color-foreground)]">
                {formatMoney(cart.subtotal)}
              </span>
            </div>
            <div className="flex justify-between text-[color:var(--color-foreground-muted)]">
              <span>Shipping</span>
              <span className="font-medium text-[color:var(--color-foreground-muted)]">
                Calculated at checkout
              </span>
            </div>
          </div>

          <div className="my-4 border-t border-[color:var(--color-border)]" />

          <div className="flex justify-between text-base font-bold text-[color:var(--color-foreground)]">
            <span>Total</span>
            <span>{formatMoney(cart.subtotal)}</span>
          </div>

          <Link href="/checkout" className="mt-5 block">
            <Button fullWidth size="lg">
              Proceed to Checkout
            </Button>
          </Link>

          <Link
            href="/categories"
            className="mt-3 block text-center text-sm text-[color:var(--color-foreground-muted)] hover:text-[color:var(--color-foreground-muted)]"
          >
            Continue shopping
          </Link>
        </Card>
      </div>
    </div>
  );
}
