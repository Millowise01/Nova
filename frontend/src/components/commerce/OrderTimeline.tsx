import { CheckCircle2, Clock3, Truck } from "lucide-react";

const timeline = [
  { icon: CheckCircle2, label: "Order confirmed", time: "08:30" },
  { icon: Clock3, label: "Packed at warehouse", time: "10:05" },
  { icon: Truck, label: "Out for delivery", time: "12:40" },
];

export function OrderTimeline() {
  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <h3 className="font-semibold">Live Status Timeline</h3>
      {timeline.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <item.icon className="text-primary" size={18} />
          <div>
            <p className="text-sm font-medium">{item.label}</p>
            <p className="text-xs text-slate-500">{item.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
