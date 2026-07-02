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
              Nova blends marketplace convenience, wallet payments, sustainability scoring, and AI recommendations tailored to your lifestyle.
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
          <div className="grid gap-3 sm:grid-cols-2">
            <Card className="bg-white/90">
              <p className="text-xs uppercase tracking-wide text-slate-500">Flash Deals</p>
              <p className="mt-2 text-2xl font-semibold">Up to 35% off</p>
              <p className="mt-1 text-sm text-slate-600">Daily curated discounts with limited inventory alerts.</p>
            </Card>
            <Card className="bg-white/90">
              <p className="text-xs uppercase tracking-wide text-slate-500">Eco Impact</p>
              <p className="mt-2 text-2xl font-semibold">1.8t CO2 Saved</p>
              <p className="mt-1 text-sm text-slate-600">Track your environmental footprint across every order.</p>
            </Card>
            <Card className="bg-white/90 sm:col-span-2">
              <p className="text-xs uppercase tracking-wide text-slate-500">AI Assistant</p>
              <p className="mt-2 text-2xl font-semibold">Personalized shopping concierge</p>
              <p className="mt-1 text-sm text-slate-600">Compare options, build gift lists, and discover products faster.</p>
            </Card>
          </div>
        </div>
      </Card>
    </section>
  );
}
