import { SalesChart } from "@/components/dashboard/SalesChart";

export default function SellerAnalyticsPage() {
  return (
    <main className="space-y-6 py-6">
      <h1 className="text-3xl font-bold">Analytics</h1>
      <SalesChart />
    </main>
  );
}
