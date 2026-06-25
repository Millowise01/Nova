import { DashboardWidgets } from "@/components/dashboard/DashboardWidgets";

const metrics = [
  { label: "Active Orders", value: "3", delta: "+1 this week" },
  { label: "Wishlist Items", value: "14", delta: "+4 this month" },
  { label: "CO2 Saved", value: "22kg", delta: "+6kg" },
  { label: "Rewards", value: "1,250 pts", delta: "+240 pts" },
];

export default function AccountDashboardPage() {
  return (
    <main className="space-y-6 py-6">
      <h1 className="text-3xl font-bold">Account Dashboard</h1>
      <DashboardWidgets metrics={metrics} />
    </main>
  );
}
