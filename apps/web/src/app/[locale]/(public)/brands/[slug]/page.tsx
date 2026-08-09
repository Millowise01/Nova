import { BrandDetailScreen } from "@/features/catalog/components/brand-detail-screen";

export default async function BrandDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <BrandDetailScreen slug={slug} />;
}
