import type { Metadata } from "next";
import { MainLayout } from "@/components/layouts";
import { ProductScreen } from "@/features/product/components/product-screen";

export const metadata: Metadata = {
  title: "Product Details",
  description: "Detailed product information, reviews, shipping, and seller trust details."
};

export default function ProductDetailsPage() {
  return (
    <MainLayout>
      <ProductScreen />
    </MainLayout>
  );
}
