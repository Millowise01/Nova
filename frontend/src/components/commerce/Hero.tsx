import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function Hero() {
  return (
    <section className="surface-gradient mt-6 rounded-3xl p-8 md:p-12">
      <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-slate-900">Sierra Leone First</span>
      <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight md:text-6xl">Sustainable shopping built for Africa's future.</h1>
      <p className="mt-4 max-w-2xl text-base text-slate-700 dark:text-slate-200">
        Discover verified local sellers, eco-conscious products, and transparent delivery tracking on Nova.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/catalog"><Button>Shop Now</Button></Link>
        <Link href="/seller/register"><Button variant="secondary">Become a Seller</Button></Link>
      </div>
    </section>
  );
}
