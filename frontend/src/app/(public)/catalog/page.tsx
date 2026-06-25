import { FilterSidebar } from "@/components/commerce/FilterSidebar";
import { ProductCarousel } from "@/components/commerce/ProductCarousel";
import { getProductsData } from "@/hooks/use-products-data";

export default function CatalogPage() {
  const products = getProductsData();

  return (
    <main className="grid gap-6 py-6 md:grid-cols-[280px_1fr]">
      <FilterSidebar />
      <div>
        <h1 className="mb-4 text-3xl font-bold">Product Catalog</h1>
        <ProductCarousel products={products} />
      </div>
    </main>
  );
}
