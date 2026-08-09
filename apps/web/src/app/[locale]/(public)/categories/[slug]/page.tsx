import { CategoryDetailScreen } from "@/features/catalog/components/category-detail-screen";

export default async function CategoryDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <CategoryDetailScreen slug={slug} />;
}
