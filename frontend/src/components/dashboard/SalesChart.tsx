"use client";

const data = [
  { month: "Jan", sales: 1200 },
  { month: "Feb", sales: 1800 },
  { month: "Mar", sales: 1500 },
  { month: "Apr", sales: 2200 },
  { month: "May", sales: 2600 },
];

function toPoints(values: number[]) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 100;
      const y = 90 - ((value - min) / (max - min || 1)) * 70;
      return `${x},${y}`;
    })
    .join(" ");
}

export function SalesChart() {
  const points = toPoints(data.map((item) => item.sales));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <p className="mb-3 text-sm font-semibold">Revenue Trend</p>
      <div className="h-64 w-full">
        <svg viewBox="0 0 100 100" className="h-full w-full">
          <polyline fill="none" stroke="#0E7A45" strokeWidth="2" points={points} />
        </svg>
        <div className="mt-2 flex justify-between text-xs text-slate-500">
          {data.map((item) => (
            <span key={item.month}>{item.month}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
