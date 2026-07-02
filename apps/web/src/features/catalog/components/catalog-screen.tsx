import { FeatureGrid, ModuleShell } from "@/features/shared/components";

const catalogModules = [
  { title: "Category Pages", description: "Top-level category exploration with curated collections." },
  { title: "Subcategory Pages", description: "Deep filtering paths for large product sets." },
  { title: "Brand Pages", description: "Dedicated brand storefronts and campaigns." },
  { title: "Seller Store", description: "Trusted seller profile and product listings." },
  { title: "Collections", description: "Seasonal and intent-based grouped products." },
  { title: "Campaign Pages", description: "Promotional landing pages for major events." },
  { title: "Flash Sale Pages", description: "Time-sensitive inventory and discount listings." },
  { title: "Search Results", description: "Search-driven product discovery and sorting." },
  { title: "Filters & Sort", description: "Drawer filters, sorting, and pagination controls." },
  { title: "Infinite Scroll", description: "Progressive product loading for continuous browsing." },
  { title: "Grid/List Toggle", description: "Alternate product rendering modes." }
];

export function CatalogScreen() {
  return (
    <ModuleShell subtitle="Catalog module architecture and reusable UX building blocks." title="Product Catalog">
      <FeatureGrid items={catalogModules} />
    </ModuleShell>
  );
}
