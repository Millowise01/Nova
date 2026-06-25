import { CheckCircle2, Clock, Package, PackageCheck, Truck, XCircle } from "lucide-react";
import type { OrderStatus } from "@/types/domain";
import { cn } from "@/lib/utils";

const STEPS: { status: OrderStatus; label: string; Icon: React.ElementType }[] = [
  { status: "PLACED", label: "Order Placed", Icon: Clock },
  { status: "CONFIRMED", label: "Confirmed", Icon: CheckCircle2 },
  { status: "PACKED", label: "Packed", Icon: Package },
  { status: "OUT_FOR_DELIVERY", label: "Out for Delivery", Icon: Truck },
  { status: "DELIVERED", label: "Delivered", Icon: PackageCheck },
];

export function OrderTimeline({ status }: { status: OrderStatus }) {
  if (status === "CANCELLED") {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/20">
        <XCircle className="text-error" />
        <p className="font-medium text-error">This order has been cancelled.</p>
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.status === status);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <h3 className="mb-6 font-semibold">Order Status</h3>
      <div className="relative">
        {/* Track line */}
        <div className="absolute left-4 top-0 h-full w-0.5 bg-slate-200 dark:bg-slate-800" />
        <div
          className="absolute left-4 top-0 w-0.5 bg-primary transition-all duration-700"
          style={{ height: `${(currentIndex / (STEPS.length - 1)) * 100}%` }}
        />

        <div className="space-y-6">
          {STEPS.map((step, i) => {
            const isCompleted = i <= currentIndex;
            const isCurrent = i === currentIndex;
            return (
              <div key={step.status} className="flex items-start gap-4 pl-2">
                <div className={cn(
                  "relative z-10 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 transition",
                  isCompleted
                    ? "border-primary bg-primary text-white"
                    : "border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900",
                )}>
                  <step.Icon size={12} />
                </div>
                <div>
                  <p className={cn("text-sm font-medium", isCompleted ? "text-slate-900 dark:text-slate-100" : "text-slate-400")}>
                    {step.label}
                  </p>
                  {isCurrent && <p className="mt-0.5 text-xs text-primary">Current status</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
