import type { Metadata } from "next";
import { Leaf, Recycle, TreePine, Zap } from "lucide-react";

export const metadata: Metadata = { title: "Sustainability" };

const commitments = [
  { Icon: Leaf, title: "Eco Score System", desc: "Every product is rated 0–100 on carbon footprint, packaging materials, and supply chain transparency." },
  { Icon: TreePine, title: "Carbon Offsetting", desc: "Nova partners with local reforestation programmes to offset delivery emissions on every order." },
  { Icon: Recycle, title: "Circular Packaging", desc: "We work with sellers to adopt reusable and biodegradable packaging standards." },
  { Icon: Zap, title: "Renewable Energy", desc: "Our data infrastructure runs on renewable energy. Seller warehouses are incentivised to do the same." },
];

const stats = [
  { value: "2.4t", label: "CO₂ Offset" },
  { value: "63%", label: "Eco-Certified Products" },
  { value: "820+", label: "Sustainable Sellers" },
  { value: "12K", label: "Eco Orders Fulfilled" },
];

export default function SustainabilityPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-14">
      <div className="surface-gradient rounded-3xl px-8 py-14 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <Leaf size={28} className="text-primary" />
        </div>
        <h1 className="text-4xl font-bold">Our Sustainability Commitment</h1>
        <p className="mx-auto mt-4 max-w-2xl text-slate-600 dark:text-slate-300">
          Sustainability isn't a feature — it's our foundation. Every decision at Nova is made with its environmental impact in mind.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-5 text-center dark:border-slate-800 dark:bg-slate-900">
            <p className="text-3xl font-bold text-primary">{s.value}</p>
            <p className="mt-1 text-sm text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      <section>
        <h2 className="mb-8 text-2xl font-bold">Our Commitments</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          {commitments.map(({ Icon, title, desc }) => (
            <div key={title} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Icon size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-slate-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="rounded-2xl bg-primary/5 p-8 text-center">
        <h2 className="text-xl font-bold">Sell sustainably with Nova</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Join hundreds of eco-certified sellers and reach customers who care about the planet.</p>
      </div>
    </div>
  );
}
