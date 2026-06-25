"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { CheckCircle2, CreditCard, MapPin, Package, Truck } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { ordersApi } from "@/lib/api";
import { formatSll } from "@/lib/format";
import { checkoutSchema, type CheckoutSchema } from "@/schemas/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const STEPS = ["Address", "Delivery", "Payment", "Review"] as const;
type Step = typeof STEPS[number];

const PAYMENT_METHODS = [
  { value: "CARD", label: "Card", icon: CreditCard },
  { value: "ORANGE_MONEY", label: "Orange Money", icon: CreditCard },
  { value: "AFRICELL_MONEY", label: "Africell Money", icon: CreditCard },
] as const;

const DELIVERY_OPTIONS = [
  { value: "standard", label: "Standard Delivery", desc: "3–5 business days", price: 15_000 },
  { value: "express", label: "Express Delivery", desc: "Next business day", price: 45_000 },
];

export function CheckoutFlow() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCartStore();
  const [step, setStep] = useState<Step>("Address");
  const [deliveryOption, setDeliveryOption] = useState(DELIVERY_OPTIONS[0]!);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<CheckoutSchema>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { paymentMethod: "CARD" },
  });

  const paymentMethod = watch("paymentMethod");
  const sub = subtotal();
  const total = sub + deliveryOption.price;

  const currentIdx = STEPS.indexOf(step);

  async function onSubmit(values: CheckoutSchema) {
    setSubmitting(true);
    try {
      await ordersApi.place({
        ...values,
        deliveryMethod: deliveryOption.value,
        items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
      });
      clearCart();
      toast.success("Order placed successfully!");
      router.push("/checkout/confirmation");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Order failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-700">
        <Package size={40} className="mx-auto mb-3 text-slate-300" />
        <p className="font-medium">Your cart is empty</p>
        <p className="mt-1 text-sm text-slate-500">Add products before checking out</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Step indicator */}
      <div className="mb-8 flex items-center gap-0">
        {STEPS.map((s, i) => (
          <div key={s} className="flex flex-1 items-center">
            <button
              type="button"
              onClick={() => i < currentIdx && setStep(s)}
              className={cn("flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold transition",
                i < currentIdx ? "bg-success text-white cursor-pointer" :
                i === currentIdx ? "bg-primary text-white" :
                "bg-slate-200 text-slate-500 dark:bg-slate-800")}
            >
              {i < currentIdx ? <CheckCircle2 size={14} /> : i + 1}
            </button>
            <p className={cn("ml-2 hidden text-xs font-medium sm:block", i === currentIdx ? "text-primary" : "text-slate-500")}>{s}</p>
            {i < STEPS.length - 1 && <div className={cn("mx-2 h-0.5 flex-1", i < currentIdx ? "bg-success" : "bg-slate-200 dark:bg-slate-800")} />}
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {/* Step: Address */}
          {step === "Address" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-center gap-2 font-semibold"><MapPin size={18} className="text-primary" />Delivery Address</div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Full name" placeholder="Aminata Koroma" {...register("addressId")} error={errors.addressId?.message} />
                <Input label="Phone number" placeholder="+232 76 000 000" />
                <div className="sm:col-span-2"><Input label="Street address" placeholder="12 Wilkinson Road" /></div>
                <Input label="City" placeholder="Freetown" />
                <Input label="Country" placeholder="Sierra Leone" defaultValue="Sierra Leone" />
              </div>
              <Button type="button" className="mt-5" onClick={() => setStep("Delivery")}>Continue to Delivery</Button>
            </div>
          )}

          {/* Step: Delivery */}
          {step === "Delivery" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-center gap-2 font-semibold"><Truck size={18} className="text-primary" />Delivery Method</div>
              <div className="space-y-3">
                {DELIVERY_OPTIONS.map((opt) => (
                  <label key={opt.value} className={cn("flex cursor-pointer items-center justify-between rounded-xl border p-4 transition",
                    deliveryOption.value === opt.value ? "border-primary bg-primary/5" : "border-slate-200 dark:border-slate-700")}>
                    <div className="flex items-center gap-3">
                      <input type="radio" checked={deliveryOption.value === opt.value} onChange={() => setDeliveryOption(opt)} className="accent-primary" />
                      <div>
                        <p className="font-medium">{opt.label}</p>
                        <p className="text-xs text-slate-500">{opt.desc}</p>
                      </div>
                    </div>
                    <span className="font-semibold text-primary">{formatSll(opt.price)}</span>
                  </label>
                ))}
              </div>
              <div className="mt-5 flex gap-3">
                <Button type="button" variant="outline" onClick={() => setStep("Address")}>Back</Button>
                <Button type="button" onClick={() => setStep("Payment")}>Continue to Payment</Button>
              </div>
            </div>
          )}

          {/* Step: Payment */}
          {step === "Payment" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-center gap-2 font-semibold"><CreditCard size={18} className="text-primary" />Payment Method</div>
              <div className="space-y-3">
                {PAYMENT_METHODS.map(({ value, label }) => (
                  <label key={value} className={cn("flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition",
                    paymentMethod === value ? "border-primary bg-primary/5" : "border-slate-200 dark:border-slate-700")}>
                    <input type="radio" value={value} {...register("paymentMethod")} className="accent-primary" />
                    <span className="font-medium">{label}</span>
                  </label>
                ))}
              </div>
              {paymentMethod === "CARD" && (
                <div className="mt-4 grid gap-4">
                  <Input label="Card number" placeholder="4242 4242 4242 4242" />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Expiry" placeholder="MM/YY" />
                    <Input label="CVV" placeholder="123" />
                  </div>
                </div>
              )}
              <div className="mt-5 flex gap-3">
                <Button type="button" variant="outline" onClick={() => setStep("Delivery")}>Back</Button>
                <Button type="button" onClick={() => setStep("Review")}>Review Order</Button>
              </div>
            </div>
          )}

          {/* Step: Review */}
          {step === "Review" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-center gap-2 font-semibold"><Package size={18} className="text-primary" />Order Review</div>
              <div className="space-y-3">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 dark:border-slate-800">
                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
                      {product.images[0] && <img src={product.images[0].url} alt={product.name} className="h-full w-full object-cover" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-slate-500">Qty: {quantity}</p>
                    </div>
                    <p className="text-sm font-semibold">{formatSll(product.priceSll * quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex gap-3">
                <Button type="button" variant="outline" onClick={() => setStep("Payment")}>Back</Button>
                <Button type="submit" disabled={submitting} className="flex-1">{submitting ? "Placing order…" : `Place Order — ${formatSll(total)}`}</Button>
              </div>
            </div>
          )}
        </div>

        {/* Order summary sidebar */}
        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-4 font-semibold">Order Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-600 dark:text-slate-400"><span>Subtotal</span><span>{formatSll(sub)}</span></div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400"><span>Delivery</span><span>{formatSll(deliveryOption.price)}</span></div>
            <div className="flex justify-between border-t border-slate-200 pt-2 font-bold dark:border-slate-700"><span>Total</span><span className="text-primary">{formatSll(total)}</span></div>
          </div>
          <p className="mt-4 text-xs text-slate-400">Prices include applicable taxes. Delivery times are estimates.</p>
        </aside>
      </div>
    </form>
  );
}
