"use client";

import { Spinner } from "@nova/ui";

import { getCategories, getPopularBrands } from "../home.mock-data";

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

import { adaptProduct } from "@/features/catalog/adapt-product";
import { useProductsQuery } from "@/features/catalog/catalog.queries";

export function HomeScreen() {
  // Categories/brands stay mocked — no backend list endpoint exists for either.
  const categories = getCategories();
  const brands = getPopularBrands();

  // Real product data. The backend has no concept of "featured" vs "trending"
  // vs "best sellers" (no such categorization exists on Product) — all three
  // sections below necessarily show the same real product list; a genuine
  // backend limitation, not a frontend oversight.
  const productsQuery = useProductsQuery();
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
        description="Real listings from Nova's catalog."
        products={products}
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
