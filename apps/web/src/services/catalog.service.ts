import type { Brand, Category, Product } from "@/types/domain";

const mockProduct = (index: number): Product => ({
  id: `product-${index}` as Product["id"],
  slug: `nova-product-${index}`,
  title: `Nova Commerce Product ${index}`,
  description: "Reliable cross-border commerce listing optimized for Sierra Leone customers.",
  price: {
    amount: 1400 + index * 50,
    currency: "SLL",
    formatted: `SLL ${(1400 + index * 50).toLocaleString()}`,
    discountPercentage: index % 3 === 0 ? 12 : undefined
  },
  rating: 4.2,
  reviewCount: 120 + index,
  images: [{ url: `/images/product-${index}.jpg`, alt: `Nova product ${index}` }],
  sellerName: "Nova Verified Seller",
  inStock: true,
  ecoScore: ["A", "B", "C"][index % 3] as Product["ecoScore"],
  category: "electronics",
  tags: ["featured", "daily-deal"]
});

export async function getFeaturedProducts(): Promise<Product[]> {
  return Array.from({ length: 8 }, (_, index) => mockProduct(index + 1));
}

export async function getTrendingProducts(): Promise<Product[]> {
  return Array.from({ length: 8 }, (_, index) => mockProduct(index + 11));
}

export async function getBestSellers(): Promise<Product[]> {
  return Array.from({ length: 8 }, (_, index) => mockProduct(index + 21));
}

export async function getCategories(): Promise<Category[]> {
  return [
    { id: "cat-electronics" as Category["id"], slug: "electronics", name: "Electronics", productCount: 2300 },
    { id: "cat-fashion" as Category["id"], slug: "fashion", name: "Fashion", productCount: 4100 },
    { id: "cat-home" as Category["id"], slug: "home-living", name: "Home & Living", productCount: 1800 },
    { id: "cat-beauty" as Category["id"], slug: "beauty", name: "Beauty", productCount: 900 }
  ];
}

export async function getPopularBrands(): Promise<Brand[]> {
  return [
    { id: "brand-1" as Brand["id"], slug: "nova-tech", name: "Nova Tech", logoUrl: "/brands/nova-tech.svg" },
    { id: "brand-2" as Brand["id"], slug: "freetown-style", name: "Freetown Style", logoUrl: "/brands/freetown-style.svg" },
    { id: "brand-3" as Brand["id"], slug: "green-market", name: "Green Market", logoUrl: "/brands/green-market.svg" }
  ];
}
