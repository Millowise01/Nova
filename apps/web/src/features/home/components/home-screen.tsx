import { getBestSellers, getCategories, getFeaturedProducts, getPopularBrands, getTrendingProducts } from "@/services/catalog.service";
import { HomeHero } from "./home-hero";
import { CategoriesSection } from "./sections/categories-section";
import { ProductSection } from "./sections/product-section";
import { BrandsSection } from "./sections/brands-section";
import { SellerSpotlightSection } from "./sections/seller-spotlight-section";
import { RecommendationsSection } from "./sections/recommendations-section";
import { EcoBannerSection } from "./sections/eco-banner-section";
import { DownloadAppSection } from "./sections/download-app-section";
import { TestimonialsSection } from "./sections/testimonials-section";
import { NewsletterSection } from "./sections/newsletter-section";

export async function HomeScreen() {
  const [categories, featured, trending, bestSellers, brands] = await Promise.all([
    getCategories(),
    getFeaturedProducts(),
    getTrendingProducts(),
    getBestSellers(),
    getPopularBrands()
  ]);

  return (
    <div className="space-y-8 pb-12 md:space-y-10 lg:space-y-12">
      <HomeHero />
      <CategoriesSection categories={categories} />
      <ProductSection description="High trust products picked by Nova's curation engine." products={featured} title="Featured Products" />
      <ProductSection description="What customers across Freetown are buying right now." products={trending} title="Trending Products" />
      <ProductSection description="Best performing items from verified sellers." products={bestSellers} title="Best Sellers" />
      <BrandsSection brands={brands} />
      <SellerSpotlightSection />
      <RecommendationsSection products={featured.slice(0, 4)} />
      <EcoBannerSection />
      <DownloadAppSection />
      <TestimonialsSection />
      <NewsletterSection />
    </div>
  );
}
