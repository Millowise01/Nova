import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Package, Truck } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Order Confirmed" };

export default function OrderConfirmationPage() {
  return (
    <div className="mx-auto max-w-xl space-y-6 py-12 text-center">
      <div className="flex justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
          <CheckCircle2 size={44} className="text-success" />
        </div>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Order Confirmed!</h1>
        <p className="mt-2 text-slate-500">
          Thank you for your purchase. Your order has been received and is being processed.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-left dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 font-semibold">What happens next?</h2>
        <div className="space-y-4">
          {[
            {
              Icon: Package,
              title: "Seller is packing your order",
              desc: "Your seller has been notified and will pack your items within 24 hours.",
            },
            {
              Icon: Truck,
              title: "Delivery partner pickup",
              desc: "A delivery partner will collect your order and head to your address.",
            },
            {
              Icon: CheckCircle2,
              title: "Delivered to your door",
              desc: "You'll receive real-time tracking updates via SMS and in-app notifications.",
            },
          ].map(({ Icon, title, desc }) => (
            <div key={title} className="flex gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Icon size={16} className="text-primary" />
              </div>
              <div>
                <p className="font-medium">{title}</p>
                <p className="text-sm text-slate-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Link href="/orders">
          <Button className="w-full py-3">Track My Order</Button>
        </Link>
        <Link href="/catalog">
          <Button variant="outline" className="w-full py-3">
            Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  );
}
