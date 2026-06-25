import Link from "next/link";
import { ArrowRight, Leaf, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/Button";

const trustBadges = [
  { Icon: ShieldCheck, label: "Verified Sellers" },
  { Icon: Leaf, label: "Eco Certified" },
  { Icon: Truck, label: "Fast Delivery" },
];

export function Hero() {
  return (
    <section className="surface-gradient relative overflow-hidden rounded-3xl px-6 py-14 md:px-12 md:py-20">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-secondary/20 blur-3xl" />
        <div className="absolute -bottom-10 left-10 h-48 w-48 rounded-full bg-primary/15 blur-2xl" />
      </div>

      <div className="relative grid items-center gap-10 lg:grid-cols-2">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/20 px-3 py-1.5 text-xs font-semibold text-secondary-foreground text-slate-800">
            <Leaf size={12} className="text-primary" />
            Sierra Leone's Sustainable Marketplace
          </span>

          <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-slate-900 md:text-5xl lg:text-6xl dark:text-slate-50">
            Shop smarter.{" "}
            <span className="text-primary">Live greener.</span>
          </h1>

          <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-700 md:text-lg dark:text-slate-300">
            Discover verified local sellers, eco-certified products, and transparent delivery tracking. Nova connects Sierra Leone with sustainable commerce.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/catalog">
              <Button className="gap-2 px-6 py-3 text-base">
                Shop Now <ArrowRight size={16} />
              </Button>
            </Link>
            <Link href="/seller/register">
              <Button variant="outline" className="px-6 py-3 text-base">
                Become a Seller
              </Button>
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            {trustBadges.map(({ Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <Icon size={16} className="text-primary" />
                {label}
              </div>
            ))}
          </div>
        </div>

        <div className="hidden lg:block">
          <div className="relative aspect-square overflow-hidden rounded-2xl shadow-soft">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?auto=format&fit=crop&w=800&q=80"
              alt="Nova sustainable shopping"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
