"use client";

import { Spinner } from "@nova/ui";

import { adaptProduct } from "@/features/catalog/adapt-product";
import {
  useBrandsQuery,
  useCategoriesQuery,
  useProductsQuery,
} from "@/features/catalog/catalog.queries";

import { HomeHero } from "./home-hero";
import { BrandsSection } from "./sections/brands-section";
import { CategoriesSection } from "./sections/categories-section";
import { DownloadAppSection } from "./sections/download-app-section";
import { EcoBannerSection } from "./sections/eco-banner-section";
import { NewsletterSection } from "./sections/newsletter-section";
import { ProductSection } from "./sections/product-section";
import { RecommendationsSection } from "./sections/recommendations-section";
import { SellerSpotlightSection } from "./sections/seller-spotlight-section";
import { TestimonialsSection } from "./sections/testimonials-section";

export function HomeScreen() {
  const categoriesQuery = useCategoriesQuery();
  const brandsQuery = useBrandsQuery();
  const categories = categoriesQuery.data?.data ?? [];
  const brands = brandsQuery.data?.data ?? [];

  // Featured now has a real backing field (Product.isFeatured) — genuinely
  // filtered, not the same list as below. Trending/Best Sellers still have no
  // real concept on the backend (no view/purchase-count tracking exists), so
  // those two necessarily keep showing the same general product list; a real
  // backend limitation, not a frontend oversight.
  const featuredQuery = useProductsQuery({ featured: true });
  const productsQuery = useProductsQuery();
  const featuredProducts = (featuredQuery.data?.pages[0]?.data ?? []).map(adaptProduct);
  const products = (productsQuery.data?.pages[0]?.data ?? []).map(adaptProduct);

  if (productsQuery.isLoading) {
    return (
      <div className="flex items-center justify-center gap-3 py-24 text-sm text-slate-600">
        <Spinner className="h-4 w-4" /> Loading...
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 md:space-y-10 lg:space-y-12">
      <HomeHero />
      <CategoriesSection categories={categories} />
      <ProductSection
        description="Real listings from Nova's catalog, marked isFeatured."
        products={featuredProducts.length > 0 ? featuredProducts : products}
        title="Featured Products"
      />
      <ProductSection
        description="What's currently in Nova's catalog."
        products={products}
        title="Trending Products"
      />
      <ProductSection
        description="Available items from verified sellers."
        products={products}
        title="Best Sellers"
      />
      <BrandsSection brands={brands} />
      <SellerSpotlightSection />
      <RecommendationsSection products={products.slice(0, 4)} />
      <EcoBannerSection />
      <DownloadAppSection />
      <TestimonialsSection />
      <NewsletterSection />
    </div>
  );
}
