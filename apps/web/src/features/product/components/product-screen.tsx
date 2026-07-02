import { FeatureGrid, ModuleShell } from "@/features/shared/components";

const productModules = [
  { title: "Image Gallery & Zoom", description: "Responsive media gallery with zoom interactions." },
  { title: "Variants & Inventory", description: "Selection logic for options, stock, and availability." },
  { title: "Specifications", description: "Structured technical specs and product metadata." },
  { title: "Reviews & Ratings", description: "Customer reviews, ratings, and Q&A." },
  { title: "Seller Information", description: "Store profile and trust signals." },
  { title: "Shipping & Warranty", description: "Delivery windows, returns, and warranty terms." },
  { title: "Related & FBT", description: "Related products and frequently-bought-together rail." },
  { title: "Recently Viewed", description: "Session-aware recommendation recovery." }
];

export function ProductScreen() {
  return (
    <ModuleShell subtitle="Product detail surface for discovery, trust, and conversion." title="Product Details">
      <FeatureGrid items={productModules} />
    </ModuleShell>
  );
}
