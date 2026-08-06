import { ProductScreen } from "@/features/product/components/product-screen";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Product Details",
  description: "Detailed product information, reviews, shipping, and seller trust details.",
});

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ProductScreen slug={slug} />;
}
