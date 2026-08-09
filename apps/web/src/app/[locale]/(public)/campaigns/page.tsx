import { CatalogScreen } from "@/features/catalog/components/catalog-screen";

// Deliberately NOT filtered — there is no campaignId on Product and no Campaign
// model (confirmed decision: Campaigns/flash-sales-the-marketing-concept belong to
// a not-yet-designed Marketing bounded context per backend/docs/00-bounded-contexts.md,
// out of scope this pass). This renders the real, unfiltered catalog rather than a
// fake "campaign" view — revisit once Marketing's schema actually exists.
export default function CampaignsPage() {
  return <CatalogScreen />;
}
