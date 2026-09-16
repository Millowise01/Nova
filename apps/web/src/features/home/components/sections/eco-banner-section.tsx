import { Badge, Card } from "@nova/ui";

// No sustainability backend exists yet (out of scope this pass — see
// sustainability-screen.tsx's own disclosed placeholder). This banner
// previously showed a fabricated "1,842 kg saved" figure; drop the invented
// number and keep this as an honest teaser instead.
export function EcoBannerSection() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8">
      <Card className="flex flex-wrap items-center justify-between gap-4 bg-emerald-50">
        <div>
          <Badge tone="success">Sustainability</Badge>
          <h2 className="mt-2 text-2xl font-semibold">
            Carbon tracking is coming to your account soon.
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            We&apos;re building eco score badges and impact dashboards into every Nova order.
          </p>
        </div>
      </Card>
    </section>
  );
}
