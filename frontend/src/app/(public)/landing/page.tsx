import { Hero } from "@/components/commerce/Hero";
import { ProductCarousel } from "@/components/commerce/ProductCarousel";
import { MotionReveal } from "@/components/ui/MotionReveal";
import { getProductsData } from "@/hooks/use-products-data";

export default function LandingPage() {
  const products = getProductsData();

  return (
    <main className="space-y-10 py-6">
      <MotionReveal>
        <Hero />
      </MotionReveal>
      <MotionReveal>
        <section>
          <h2 className="mb-4 text-2xl font-semibold">Trending Sustainable Picks</h2>
          <ProductCarousel products={products} />
        </section>
      </MotionReveal>
    </main>
  );
}
