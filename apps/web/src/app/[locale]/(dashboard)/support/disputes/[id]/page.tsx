import { DisputeDetailScreen } from "@/features/trust-safety/components/dispute-detail-screen";

export default async function DisputeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DisputeDetailScreen id={id} />;
}
