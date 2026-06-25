import type { Product } from "@/types/domain";

export function getProductsData(): Product[] {
  return [
    {
      id: "1",
      name: "Solar Lantern",
      slug: "solar-lantern",
      priceSll: 320,
      ecoScore: 94,
      image: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=800&q=80",
      brand: "EcoLight",
      category: "Energy",
    },
    {
      id: "2",
      name: "Organic Cocoa Butter",
      slug: "organic-cocoa-butter",
      priceSll: 240,
      ecoScore: 90,
      image: "https://images.unsplash.com/photo-1615486363973-f79cccbf9f5f?auto=format&fit=crop&w=800&q=80",
      brand: "BoFarm",
      category: "Beauty",
    },
    {
      id: "3",
      name: "Recycled Tote Bag",
      slug: "recycled-tote-bag",
      priceSll: 150,
      ecoScore: 86,
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
      brand: "Freetown Threads",
      category: "Fashion",
    },
    {
      id: "4",
      name: "Bamboo Cutlery Set",
      slug: "bamboo-cutlery-set",
      priceSll: 170,
      ecoScore: 91,
      image: "https://images.unsplash.com/photo-1601050690597-7d4f3f2f0d17?auto=format&fit=crop&w=800&q=80",
      brand: "GreenRoot",
      category: "Home",
    },
  ];
}
