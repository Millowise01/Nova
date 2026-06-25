import type { Metadata } from "next";
import { Leaf, ShieldCheck, Zap } from "lucide-react";

export const metadata: Metadata = { title: "About Us", description: "Learn about Nova's mission to build sustainable commerce for Sierra Leone." };

const values = [
  { Icon: Leaf, title: "Sustainability First", desc: "Every product, seller, and delivery is evaluated for environmental impact." },
  { Icon: ShieldCheck, title: "Verified Trust", desc: "Sellers are vetted, products are authenticated, and transactions are secured." },
  { Icon: Zap, title: "Built for Speed", desc: "Mobile-first infrastructure designed for West Africa's growing connectivity." },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-14">
      <div className="surface-gradient rounded-3xl px-8 py-14 text-center">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50">About Nova</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
          Nova is Sierra Leone's sustainable e-commerce platform — built to empower local sellers, protect the environment, and connect communities through trusted commerce.
        </p>
      </div>

      <section>
        <h2 className="mb-8 text-center text-2xl font-bold">Our Mission</h2>
        <p className="mx-auto max-w-3xl text-center text-slate-600 dark:text-slate-400">
          We believe commerce can be a force for good. Our mission is to build the most trusted, eco-conscious marketplace in West Africa — one that lifts local businesses, reduces environmental harm, and creates lasting economic opportunity.
        </p>
      </section>

      <section>
        <h2 className="mb-8 text-center text-2xl font-bold">Our Values</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {values.map(({ Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-slate-200 bg-white p-6 text-center dark:border-slate-800 dark:bg-slate-900">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Icon size={22} className="text-primary" />
              </div>
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-2xl font-bold">Our Story</h2>
        <div className="space-y-4 text-slate-600 dark:text-slate-400">
          <p>Nova was founded in Freetown with a simple idea: make it easy for Sierra Leoneans to buy and sell online, while caring for the planet they live on.</p>
          <p>We started by connecting local artisans, farmers, and manufacturers with buyers across the country. Today, we're building the infrastructure for West Africa's next generation of sustainable trade.</p>
          <p>From solar lanterns to organic cocoa butter, every product on Nova tells the story of a local entrepreneur working to build a better future.</p>
        </div>
      </section>
    </div>
  );
}
