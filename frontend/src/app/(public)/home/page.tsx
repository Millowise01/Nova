import { SearchBar } from "@/components/commerce/SearchBar";
import { ProductCarousel } from "@/components/commerce/ProductCarousel";
import { getProductsData } from "@/hooks/use-products-data";

export default function HomePage() {
  const products = getProductsData();

  return (
    <main className="space-y-8 py-6">
      <h1 className="text-3xl font-bold">Home</h1>
      <SearchBar />
      <ProductCarousel products={products} />
    </main>
  );
}
