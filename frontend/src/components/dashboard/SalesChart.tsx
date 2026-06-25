"use client";

import { Card } from "@/components/ui/Card";

interface DataPoint { label: string; value: number }

const defaultData: DataPoint[] = [
  { label: "Jan", value: 1_200_000 },
  { label: "Feb", value: 1_850_000 },
  { label: "Mar", value: 1_420_000 },
  { label: "Apr", value: 2_310_000 },
  { label: "May", value: 2_640_000 },
  { label: "Jun", value: 2_100_000 },
];

export function SalesChart({ data = defaultData, title = "Revenue Trend" }: { data?: DataPoint[]; title?: string }) {
  const W = 300;
  const H = 120;
  const PAD = { top: 10, right: 10, bottom: 24, left: 10 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const maxVal = Math.max(...data.map((d) => d.value));
  const minVal = Math.min(...data.map((d) => d.value));
  const range = maxVal - minVal || 1;

  const pts = data.map((d, i) => ({
    x: PAD.left + (i / (data.length - 1)) * chartW,
    y: PAD.top + chartH - ((d.value - minVal) / range) * chartH,
    ...d,
  }));

  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${pts[pts.length - 1]!.x} ${H - PAD.bottom} L ${pts[0]!.x} ${H - PAD.bottom} Z`;

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{title}</p>
        <span className="text-xs text-slate-400">Last 6 months</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-label={title}>
        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map((t) => (
          <line key={t} x1={PAD.left} x2={W - PAD.right} y1={PAD.top + chartH * (1 - t)} y2={PAD.top + chartH * (1 - t)} stroke="#e2e8f0" strokeWidth="1" />
        ))}
        {/* Area fill */}
        <path d={areaPath} fill="#0E7A45" fillOpacity="0.08" />
        {/* Line */}
        <path d={linePath} fill="none" stroke="#0E7A45" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Dots */}
        {pts.map((p) => (
          <circle key={p.label} cx={p.x} cy={p.y} r="3" fill="#0E7A45" />
        ))}
        {/* X labels */}
        {pts.map((p) => (
          <text key={p.label} x={p.x} y={H - 4} textAnchor="middle" fontSize="8" fill="#94a3b8">{p.label}</text>
        ))}
      </svg>
    </Card>
  );
}
