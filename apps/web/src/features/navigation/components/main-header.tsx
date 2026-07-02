import Link from "next/link";
import { Button, Input } from "@nova/ui";

const topLinks = [
  { href: "/categories", label: "Categories" },
  { href: "/brands", label: "Brands" },
  { href: "/deals", label: "Deals" },
  { href: "/seller-store", label: "Seller Store" }
];

export function MainHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--ds-border)] bg-white/95 backdrop-blur">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[color:var(--ds-primary)] focus:shadow"
      >
        Skip to content
      </a>
      <div className="mx-auto grid w-full max-w-7xl gap-3 px-4 py-3 md:grid-cols-[12rem_minmax(0,1fr)_auto] md:items-center md:px-6 lg:px-8">
        <Link className="text-xl font-semibold text-[color:var(--ds-text)]" href="/">
          Nova
        </Link>
        <Input aria-label="Search products" placeholder="Search products, sellers, categories" type="search" />
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost">
            Account
          </Button>
          <Button size="sm">Cart</Button>
        </div>
      </div>
      <nav className="mx-auto hidden w-full max-w-7xl items-center gap-6 px-4 pb-3 text-sm md:flex md:px-6 lg:px-8">
        {topLinks.map((item) => (
          <Link className="font-medium text-slate-700 hover:text-[color:var(--ds-primary)]" href={item.href} key={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
