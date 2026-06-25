import { OrderTimeline } from "@/components/commerce/OrderTimeline";

export default function OrdersPage() {
  return (
    <main className="space-y-6 py-6">
      <h1 className="text-3xl font-bold">Order Tracking</h1>
      <OrderTimeline />
    </main>
  );
}
