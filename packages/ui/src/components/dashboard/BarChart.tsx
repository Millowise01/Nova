"use client";

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { Skeleton } from "@nova/design-system";
import { cn } from "@nova/utils";

import {
  chartAxisProps,
  chartLegendStyle,
  chartTooltipStyle,
  resolveSeriesColor,
  type ChartSeries,
} from "./chart-theme";

export interface BarChartProps {
  data: Record<string, unknown>[];
  xKey: string;
  series: ChartSeries[];
  height?: number;
  loading?: boolean;
  stacked?: boolean;
  className?: string;
}

/** Themed Recharts bar chart — reads Nova color tokens only, no hardcoded hex. */
export function BarChart({
  data,
  xKey,
  series,
  height = 300,
  loading = false,
  stacked = false,
  className,
}: BarChartProps) {
  if (loading) {
    return <Skeleton className={cn("w-full rounded-lg", className)} style={{ height }} />;
  }

  return (
    <div className={cn("w-full", className)} style={{ height }} role="img" aria-label="Bar chart">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey={xKey} {...chartAxisProps} />
          <YAxis width={40} {...chartAxisProps} />
          <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: "var(--color-muted)" }} />
          {series.length > 1 && <Legend wrapperStyle={chartLegendStyle} />}
          {series.map((s, i) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.label ?? s.key}
              fill={resolveSeriesColor(s.color, i)}
              radius={[4, 4, 0, 0]}
              stackId={stacked ? "stack" : undefined}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
