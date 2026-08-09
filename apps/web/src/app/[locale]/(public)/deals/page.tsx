import { FilteredCatalogScreen } from "@/features/catalog/components/filtered-catalog-screen";

// "Deals" = curated/featured picks (Product.isFeatured) — the closest real concept
// the backend has to "deals"; there's no discount/price-drop field to filter on.
export default function DealsPage() {
  return (
    <FilteredCatalogScreen
      description="Curated picks from Nova's catalog."
      filters={{ featured: true }}
      title="Deals"
    />
  );
}
