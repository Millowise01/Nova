import { OrderDetailScreen } from "@/features/orders/components/order-detail-screen";

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OrderDetailScreen orderId={id} />;
}
