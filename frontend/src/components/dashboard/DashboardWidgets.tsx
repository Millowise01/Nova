import { TrendingDown, TrendingUp } from "lucide-react";
import type { DashboardMetric } from "@/types/domain";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export function DashboardWidgets({ metrics }: { metrics: DashboardMetric[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((m) => (
        <Card key={m.label} className="space-y-2">
          <p className="text-sm text-slate-500 dark:text-slate-400">{m.label}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{m.value}</p>
          <div className={cn("flex items-center gap-1 text-xs font-medium", m.positive !== false ? "text-success" : "text-error")}>
            {m.positive !== false ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {m.delta}
          </div>
        </Card>
      ))}
    </div>
  );
}
