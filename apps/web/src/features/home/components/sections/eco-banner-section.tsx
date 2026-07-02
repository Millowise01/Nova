import { Badge, Card } from "@nova/ui";

export function EcoBannerSection() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8">
      <Card className="flex flex-wrap items-center justify-between gap-4 bg-emerald-50">
        <div>
          <Badge tone="success">Sustainability</Badge>
          <h2 className="mt-2 text-2xl font-semibold">Track your carbon savings with every Nova order.</h2>
          <p className="mt-1 text-sm text-slate-600">Eco score badges and impact dashboards are integrated directly into your account.</p>
        </div>
        <p className="text-3xl font-semibold text-emerald-700">1,842 kg saved</p>
      </Card>
    </section>
  );
}
