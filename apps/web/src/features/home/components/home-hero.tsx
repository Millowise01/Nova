import Link from "next/link";

import { Badge, Button } from "@nova/ui";

export function HomeHero() {
  return (
    <section className="relative overflow-hidden bg-[color:var(--color-surface-nav)]">
      <div className="relative mx-auto w-full max-w-7xl px-4 py-16 md:px-6 md:py-24 lg:px-8">
        <div className="grid items-center gap-12 md:grid-cols-2">
          {/* Left — copy */}
          <div className="space-y-6">
            <Badge tone="primary" className="border border-white/20 bg-white/10 text-white">
              Sierra Leone Commerce Reimagined
            </Badge>

            <h1 className="text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
              Shop trusted products from{" "}
              <span className="text-[color:var(--color-accent)]">local & global</span> sellers.
            </h1>

            <p className="max-w-lg text-lg text-white/70">
              Nova blends marketplace convenience, wallet payments, sustainability scoring, and AI
              recommendations tailored to your lifestyle.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/categories">
                <Button size="lg" variant="accent">
                  Start Shopping
                </Button>
              </Link>
              <Link href="/deals">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  Explore Deals
                </Button>
              </Link>
            </div>
          </div>

          {/* Right — feature cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 rounded-xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-medium text-[color:var(--color-accent)]">Featured Picks</p>
              <p className="mt-2 text-xl font-bold text-white">Curated by Nova</p>
              <p className="mt-1 text-sm text-white/60">
                Featured products from Nova&apos;s catalog, updated as sellers list them.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-[color:var(--color-accent)]">Eco Impact</p>
                <Badge tone="neutral">Coming soon</Badge>
              </div>
              <p className="mt-2 text-lg font-bold text-white">Carbon tracking</p>
              <p className="mt-1 text-xs text-white/60">Footprint tracking for every order.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-[color:var(--color-accent)]">AI Assistant</p>
                <Badge tone="neutral">Coming soon</Badge>
              </div>
              <p className="mt-2 text-lg font-bold text-white">Smart concierge</p>
              <p className="mt-1 text-xs text-white/60">Compare & discover faster.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
