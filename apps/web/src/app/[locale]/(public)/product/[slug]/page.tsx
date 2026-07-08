import { MainLayout } from "@/components/layouts";
import { ModuleScreen } from "@/features/shared/components";
import { moduleMap } from "@/features/docs/module-map";

export default function ProductDetailsPage() {
  return (
    <MainLayout>
      <ModuleScreen
        breadcrumb={[{ href: "/", label: "Home" }, { href: "/product/sample", label: "Product" }]}
        cards={moduleMap.product}
        subtitle="Product details architecture supports gallery, variants, seller trust, reviews, policies, and cross-sell blocks."
        title="Product Details"
      />
    </MainLayout>
  );
}
