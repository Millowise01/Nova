import { DashboardWidgets } from "@/components/dashboard/DashboardWidgets";

const metrics = [
  { label: "Revenue", value: "SLL 45,200", delta: "+12%" },
  { label: "Orders", value: "302", delta: "+8%" },
  { label: "Inventory Alerts", value: "6", delta: "-2" },
  { label: "Rating", value: "4.8", delta: "+0.2" },
];

export default function SellerDashboardPage() {
  return (
    <main className="space-y-6 py-6">
      <h1 className="text-3xl font-bold">Seller Dashboard</h1>
      <DashboardWidgets metrics={metrics} />
    </main>
  );
}
