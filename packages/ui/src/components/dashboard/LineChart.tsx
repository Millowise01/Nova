"use client";

import {
  LineChart as RechartsLineChart,
  Line,
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

export interface LineChartProps {
  data: Record<string, unknown>[];
  xKey: string;
  series: ChartSeries[];
  height?: number;
  loading?: boolean;
  className?: string;
}

/** Themed Recharts line chart — reads Nova color tokens only, no hardcoded hex. */
export function LineChart({
  data,
  xKey,
  series,
  height = 300,
  loading = false,
  className,
}: LineChartProps) {
  if (loading) {
    return <Skeleton className={cn("w-full rounded-lg", className)} style={{ height }} />;
  }

  return (
    <div className={cn("w-full", className)} style={{ height }} role="img" aria-label="Line chart">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey={xKey} {...chartAxisProps} />
          <YAxis width={40} {...chartAxisProps} />
          <Tooltip
            contentStyle={chartTooltipStyle}
            cursor={{ stroke: "var(--color-border-strong)" }}
          />
          {series.length > 1 && <Legend wrapperStyle={chartLegendStyle} />}
          {series.map((s, i) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label ?? s.key}
              stroke={resolveSeriesColor(s.color, i)}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}
