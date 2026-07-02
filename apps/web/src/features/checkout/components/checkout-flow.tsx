"use client";

import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button, Card, Input, Select } from "@nova/ui";
import { checkoutSchema, type CheckoutFormValues } from "../checkout.schemas";

const steps = ["Address", "Delivery", "Payment", "Review", "Confirmation"] as const;

export function CheckoutFlow() {
  const [step, setStep] = useState(0);
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      addressLine: "",
      city: "",
      district: "",
      phone: "",
      deliveryMethod: "standard",
      paymentMethod: "wallet",
      promoCode: ""
    }
  });

  const stepName = useMemo(() => steps[step], [step]);

  return (
    <div className="space-y-5">
      <ol className="grid gap-2 rounded-2xl border border-[color:var(--ds-border)] bg-white p-3 md:grid-cols-5">
        {steps.map((item, index) => (
          <li className={`rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wide ${index === step ? "bg-[color:var(--ds-primary)] text-white" : "bg-slate-100 text-slate-600"}`} key={item}>
            {index + 1}. {item}
          </li>
        ))}
      </ol>

      <Card className="space-y-4">
        <h2 className="text-xl font-semibold">{stepName}</h2>

        <form className="grid gap-3 md:grid-cols-2" onSubmit={form.handleSubmit(() => undefined)}>
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
          <Input className="md:col-span-2" placeholder="Promo code" {...form.register("promoCode")} />
        </form>

        <div className="flex flex-wrap justify-between gap-3">
          <Button disabled={step === 0} onClick={() => setStep((value) => Math.max(0, value - 1))} variant="outline">
            Back
          </Button>
          <Button onClick={() => setStep((value) => Math.min(steps.length - 1, value + 1))}>{step === steps.length - 1 ? "Place Order" : "Continue"}</Button>
        </div>
      </Card>
    </div>
  );
}
