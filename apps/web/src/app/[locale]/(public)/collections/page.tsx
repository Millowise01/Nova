import { CatalogScreen } from "@/features/catalog/components/catalog-screen";

// Deliberately NOT filtered — there is no collectionId on Product and no
// Collection model (confirmed decision: out of scope this pass, alongside
// Campaign — see campaigns/page.tsx's comment for the full reasoning). This
// renders the real, unfiltered catalog rather than a fake "collection" view.
export default function CollectionsPage() {
  return <CatalogScreen />;
}
