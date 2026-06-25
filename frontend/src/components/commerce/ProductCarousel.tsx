import type { Product } from "@/types/domain";
import { ProductCard } from "@/components/commerce/ProductCard";

export function ProductCarousel({ products }: { products: Product[] }) {
  return (
    <div className="grid gap-4 overflow-x-auto pb-2 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
