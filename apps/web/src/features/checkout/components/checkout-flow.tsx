"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { Button, Card, Input, Select } from "@nova/ui";

import { useCreateOrderMutation } from "@/features/orders/orders.mutations";
import { ensureCartId, createCheckoutSession } from "@/services/cart-checkout.service";

import { checkoutSchema, type CheckoutFormValues } from "../checkout.schemas";

const steps = ["Address", "Delivery", "Payment", "Review", "Confirmation"] as const;

export function CheckoutFlow() {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const createOrder = useCreateOrderMutation();

  // Generated once per mount of this component — i.e. once per checkout
  // ATTEMPT — and reused across every retry of that same attempt (including a
  // double-click on "Place Order"), per docs/frontend/01-data-fetching-
  // conventions.md's idempotency convention. A genuinely new attempt (the user
  // navigates away and back) remounts this component and gets a fresh key.
  const idempotencyKey = useState(() => crypto.randomUUID())[0];

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      addressLine: "",
      city: "",
      district: "",
      phone: "",
      deliveryMethod: "standard",
      paymentMethod: "wallet",
      promoCode: "",
    },
  });

  const stepName = useMemo(() => steps[step], [step]);
  const isLastStep = step === steps.length - 1;

  const onSubmit = async (data: CheckoutFormValues) => {
    setSubmitting(true);
    try {
      const cartId = await ensureCartId();
      const session = await createCheckoutSession(cartId, data);
      const order = await createOrder.mutateAsync({
        checkoutSessionId: session.id,
        idempotencyKey,
      });
      router.push(`/orders/${order.id}`);
    } catch {
      // createOrder's own onError already surfaces a toast; a session-creation
      // failure (e.g. empty cart) falls through to here with no toast yet.
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <ol className="grid gap-2 rounded-2xl border border-[color:var(--ds-border)] bg-white p-3 md:grid-cols-5">
        {steps.map((item, index) => (
          <li
            key={item}
            className={`rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wide ${
              index === step
                ? "bg-[color:var(--ds-primary)] text-white"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {index + 1}. {item}
          </li>
        ))}
      </ol>

      <Card className="space-y-4">
        <h2 className="text-xl font-semibold">{stepName}</h2>

        <form
          className="grid gap-3 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
          }}
        >
          <Input placeholder="Address line" {...form.register("addressLine")} />

          <Input placeholder="Phone" {...form.register("phone")} />

          <Input placeholder="City" {...form.register("city")} />

          <Input placeholder="District" {...form.register("district")} />

          <Select {...form.register("deliveryMethod")}>
            <option value="standard">Standard Delivery</option>
            <option value="express">Express Delivery</option>
            <option value="pickup">Pickup Station</option>
          </Select>

          <Select {...form.register("paymentMethod")}>
            <option value="wallet">Nova Wallet</option>
            <option value="card">Card</option>
            <option value="mobile-money">Mobile Money</option>
          </Select>

          <Input
            className="md:col-span-2"
            placeholder="Promo code"
            {...form.register("promoCode")}
          />
        </form>

        <div className="flex flex-wrap justify-between gap-3">
          <Button
            variant="outline"
            disabled={step === 0}
            onClick={() => setStep((value) => Math.max(0, value - 1))}
          >
            Back
          </Button>

          <Button
            disabled={submitting || createOrder.isPending}
            onClick={() => {
              if (isLastStep) {
                void form.handleSubmit(onSubmit)();
              } else {
                setStep((value) => Math.min(steps.length - 1, value + 1));
              }
            }}
          >
            {isLastStep
              ? submitting || createOrder.isPending
                ? "Placing order..."
                : "Place Order"
              : "Continue"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
