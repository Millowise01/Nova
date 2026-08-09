import { FilteredCatalogScreen } from "@/features/catalog/components/filtered-catalog-screen";

export default function FlashSalesPage() {
  return (
    <FilteredCatalogScreen
      description="Time-limited flash sale listings."
      filters={{ flashSale: true }}
      title="Flash Sales"
    />
  );
}
