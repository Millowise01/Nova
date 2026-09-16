import Link from "next/link";

import { Badge, Button, Card } from "@nova/ui";

export function HomeHero() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 pt-8 md:px-6 lg:px-8">
      <Card className="overflow-hidden border-none bg-gradient-to-br from-emerald-50 via-white to-cyan-50 p-0 shadow-lg">
        <div className="grid gap-8 p-8 md:grid-cols-[1.1fr_1fr] md:p-12">
          <div className="space-y-5">
            <Badge tone="primary">Sierra Leone Commerce Reimagined</Badge>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-[color:var(--ds-text)] md:text-5xl">
              Shop trusted products from local and global sellers in one experience.
            </h1>
            <p className="max-w-xl text-base text-slate-600">
              Nova blends marketplace convenience, wallet payments, sustainability scoring, and AI
              recommendations tailored to your lifestyle.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/categories">
                <Button size="lg">Start Shopping</Button>
              </Link>
              <Link href="/deals">
                <Button size="lg" variant="outline">
                  Explore Deals
                </Button>
              </Link>
            </div>
          </div>
          {/* Backend has no discount/price-drop field (see /deals's own honest
              "Curated picks" framing) and no sustainability or AI backend at
              all — this used to claim "Up to 35% off", "1.8t CO2 Saved", and
              a live "Personalized shopping concierge", none of which exist.
              Matches the Coming soon standard already applied to /sustainability
              and /ai-assistant. */}
          <div className="grid gap-3 sm:grid-cols-2">
            <Card className="bg-white/90">
              <p className="text-xs uppercase tracking-wide text-slate-500">Featured Picks</p>
              <p className="mt-2 text-2xl font-semibold">Curated by Nova</p>
              <p className="mt-1 text-sm text-slate-600">
                Featured products from Nova&apos;s catalog, updated as sellers list them.
              </p>
            </Card>
            <Card className="bg-white/90">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs uppercase tracking-wide text-slate-500">Eco Impact</p>
                <Badge tone="info">Coming soon</Badge>
              </div>
              <p className="mt-2 text-2xl font-semibold">Carbon tracking</p>
              <p className="mt-1 text-sm text-slate-600">
                We&apos;re building environmental footprint tracking into every order.
              </p>
            </Card>
            <Card className="bg-white/90 sm:col-span-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs uppercase tracking-wide text-slate-500">AI Assistant</p>
                <Badge tone="info">Coming soon</Badge>
              </div>
              <p className="mt-2 text-2xl font-semibold">Personalized shopping concierge</p>
              <p className="mt-1 text-sm text-slate-600">
                Compare options, build gift lists, and discover products faster.
              </p>
            </Card>
          </div>
        </div>
      </Card>
    </section>
  );
}
