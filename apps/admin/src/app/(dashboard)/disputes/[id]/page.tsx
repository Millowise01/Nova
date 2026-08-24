import { DisputeDetailScreen } from "@/features/trust-safety/components/dispute-detail-screen";

interface DisputeDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function DisputeDetailPage({ params }: DisputeDetailPageProps) {
  const { id } = await params;
  return <DisputeDetailScreen id={id} />;
}
