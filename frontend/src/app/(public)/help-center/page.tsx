import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, CreditCard, Package, Settings, ShieldCheck, Truck } from "lucide-react";

export const metadata: Metadata = { title: "Help Center" };

const categories = [
  { Icon: Package, title: "Orders & Tracking", desc: "Place orders, track shipments, manage returns", href: "/faq" },
  { Icon: CreditCard, title: "Payments & Billing", desc: "Payment methods, invoices, refunds", href: "/faq" },
  { Icon: Truck, title: "Delivery", desc: "Delivery zones, times, and fees", href: "/faq" },
  { Icon: ShieldCheck, title: "Account & Security", desc: "Password, 2FA, account verification", href: "/faq" },
  { Icon: BookOpen, title: "Selling on Nova", desc: "Seller registration, listings, payouts", href: "/seller/register" },
  { Icon: Settings, title: "Technical Support", desc: "App issues, accessibility, browser support", href: "/contact" },
];

const articles = [
  { title: "How to track your order in real-time", href: "/faq" },
  { title: "Accepted payment methods in Sierra Leone", href: "/faq" },
  { title: "How to apply for eco certification", href: "/sustainability" },
  { title: "Setting up two-factor authentication", href: "/faq" },
  { title: "How to register as a seller", href: "/seller/register" },
];

export default function HelpCenterPage() {
  return (
    <div className="space-y-10">
      <div className="surface-gradient rounded-3xl px-8 py-12 text-center">
        <h1 className="text-3xl font-bold">How can we help?</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">Browse topics or search for specific answers</p>
      </div>

      <section>
        <h2 className="mb-5 text-xl font-bold">Browse Topics</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map(({ Icon, title, desc, href }) => (
            <Link key={title} href={href}
              className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:shadow-soft dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10"><Icon size={18} className="text-primary" /></div>
              <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-0.5 text-xs text-slate-500">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-5 text-xl font-bold">Popular Articles</h2>
        <div className="space-y-2">
          {articles.map((a) => (
            <Link key={a.title} href={a.href}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-3.5 transition hover:border-primary dark:border-slate-800 dark:bg-slate-900">
              <span className="text-sm font-medium">{a.title}</span>
              <span className="text-xs text-primary">Read →</span>
            </Link>
          ))}
        </div>
      </section>

      <div className="rounded-2xl bg-slate-50 p-6 text-center dark:bg-slate-900">
        <p className="font-medium">Still need help?</p>
        <p className="mt-1 text-sm text-slate-500">Our support team is available Monday–Saturday, 8am–6pm WAT</p>
        <Link href="/contact" className="mt-4 inline-flex rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90">Contact Support</Link>
      </div>
    </div>
  );
}
