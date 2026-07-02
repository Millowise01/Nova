import { MainLayout } from "@/components/layouts";
import { ModuleScreen } from "@/features/shared/components";
import { moduleMap } from "@/features/docs/module-map";

export default function CategoriesPage() {
  return (
    <MainLayout>
      <ModuleScreen
        breadcrumb={[{ href: "/", label: "Home" }, { href: "/categories", label: "Categories" }]}
        cards={moduleMap.catalog}
        subtitle="Composable catalog pages with filters, sorting, pagination, and campaign support."
        title="Product Catalog"
      />
    </MainLayout>
  );
}
import { MainLayout } from "@/components/layouts";
import { CatalogScreen } from "@/features/catalog/components/catalog-screen";

export default function CategoriesPage() {
  return (
    <MainLayout>
      <CatalogScreen />
    </MainLayout>
  );
}
