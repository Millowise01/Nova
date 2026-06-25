import { DashboardWidgets } from "@/components/dashboard/DashboardWidgets";
import { SalesChart } from "@/components/dashboard/SalesChart";

const metrics = [
  { label: "GMV", value: "SLL 1.2M", delta: "+16%" },
  { label: "Users", value: "24,120", delta: "+11%" },
  { label: "Sellers", value: "820", delta: "+9%" },
  { label: "Fulfillment", value: "97.5%", delta: "+0.8%" },
];

export default function AdminOverviewPage() {
  return (
    <main className="space-y-6 py-6">
      <h1 className="text-3xl font-bold">Overview Dashboard</h1>
      <DashboardWidgets metrics={metrics} />
      <SalesChart />
    </main>
  );
}
