import type { Brand, Category } from "@/types/domain";

// MOCKED — intentionally, not an oversight. There is no GET /categories or
// GET /brands endpoint on the backend (confirmed against the live route
// table — only POST/create exists for both). Wiring these to something real
// isn't possible without a new backend endpoint, which is out of scope for
// this pass. Revisit once the backend adds list endpoints for these.
export function getCategories(): Category[] {
  return [
    {
      id: "cat-electronics" as Category["id"],
      slug: "electronics",
      name: "Electronics",
      productCount: 2300,
    },
    { id: "cat-fashion" as Category["id"], slug: "fashion", name: "Fashion", productCount: 4100 },
    {
      id: "cat-home" as Category["id"],
      slug: "home-living",
      name: "Home & Living",
      productCount: 1800,
    },
    { id: "cat-beauty" as Category["id"], slug: "beauty", name: "Beauty", productCount: 900 },
  ];
}

export function getPopularBrands(): Brand[] {
  return [
    {
      id: "brand-1" as Brand["id"],
      slug: "nova-tech",
      name: "Nova Tech",
      logoUrl: "/brands/nova-tech.svg",
    },
    {
      id: "brand-2" as Brand["id"],
      slug: "freetown-style",
      name: "Freetown Style",
      logoUrl: "/brands/freetown-style.svg",
    },
    {
      id: "brand-3" as Brand["id"],
      slug: "green-market",
      name: "Green Market",
      logoUrl: "/brands/green-market.svg",
    },
  ];
}
