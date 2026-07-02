import { Card } from "@nova/ui";
import { SectionTitle } from "@/features/shared/components";

export function SellerSpotlightSection() {
  return (
    <section className="mx-auto w-full max-w-7xl space-y-4 px-4 md:px-6 lg:px-8">
      <SectionTitle description="Featured seller storefronts with outstanding delivery and quality scores." title="Seller Spotlight" />
      <Card className="grid gap-5 md:grid-cols-3">
        <div>
          <p className="text-sm text-slate-500">Top seller</p>
          <p className="mt-1 text-xl font-semibold">Freetown Tech Hub</p>
        </div>
        <div>
          <p className="text-sm text-slate-500">Fulfillment score</p>
          <p className="mt-1 text-xl font-semibold">98.2%</p>
        </div>
        <div>
          <p className="text-sm text-slate-500">Response time</p>
          <p className="mt-1 text-xl font-semibold">Under 10 min</p>
        </div>
      </Card>
    </section>
  );
}
