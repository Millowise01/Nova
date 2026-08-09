import { SellerStoreScreen } from "@/features/catalog/components/seller-store-screen";

export default async function SellerStorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <SellerStoreScreen sellerId={slug} />;
}
