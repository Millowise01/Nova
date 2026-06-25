import type { DashboardMetric } from "@/types/domain";
import { Card } from "@/components/ui/Card";

export function DashboardWidgets({ metrics }: { metrics: DashboardMetric[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.label}>
          <p className="text-sm text-slate-500">{metric.label}</p>
          <p className="mt-2 text-2xl font-semibold">{metric.value}</p>
          <p className="mt-1 text-xs text-success">{metric.delta}</p>
        </Card>
      ))}
    </div>
  );
}
