import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import type { Product } from "@/types/domain";

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await apiClient.get<Product[]>("/products");
      return data;
    },
    initialData: [
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
    ],
  });
}
