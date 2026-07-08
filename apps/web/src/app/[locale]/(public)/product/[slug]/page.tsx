import { buildMetadata } from "@/lib/metadata";
import { ProductScreen } from "@/features/product/components/product-screen";

export const metadata = buildMetadata({
  title: "Product Details",
  description: "Detailed product information, reviews, shipping, and seller trust details.",
});

export default function ProductDetailsPage() {
  return <ProductScreen />;
}
