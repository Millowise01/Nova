import { Card } from "@/components/ui/Card";

const steps = ["Address Selection", "Delivery Method", "Payment Method", "Order Summary", "Confirmation"];

export function CheckoutFlow() {
  return (
    <Card>
      <h2 className="mb-4 text-xl font-semibold">Checkout Flow</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {steps.map((step, index) => (
          <div key={step} className="rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-700">
            <p className="text-xs text-slate-500">Step {index + 1}</p>
            <p className="font-medium">{step}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
