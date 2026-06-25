"use client";

import Link from "next/link";
import { Moon, Search, ShoppingCart, Sun } from "lucide-react";
import { useUiStore } from "@/store/ui-store";

const links = [
  { href: "/home", label: "Home" },
  { href: "/catalog", label: "Catalog" },
  { href: "/deals", label: "Deals" },
  { href: "/eco-products", label: "Eco" },
  { href: "/seller-storefront", label: "Sellers" },
];

export function Navbar() {
  const theme = useUiStore((s) => s.theme);
  const toggleTheme = useUiStore((s) => s.toggleTheme);
  const setGlobalSearchOpen = useUiStore((s) => s.setGlobalSearchOpen);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 lg:px-6">
        <Link href="/" className="text-2xl font-bold text-primary">
          Nova
        </Link>
        <div className="hidden items-center gap-5 md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-slate-700 hover:text-primary dark:text-slate-200">
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            aria-label="Open search"
            className="rounded-xl border border-slate-200 p-2 dark:border-slate-700"
            onClick={() => setGlobalSearchOpen(true)}
          >
            <Search size={18} />
          </button>
          <Link href="/cart" className="rounded-xl border border-slate-200 p-2 dark:border-slate-700" aria-label="Cart">
            <ShoppingCart size={18} />
          </Link>
          <button
            aria-label="Toggle theme"
            className="rounded-xl border border-slate-200 p-2 dark:border-slate-700"
            onClick={toggleTheme}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </nav>
    </header>
  );
}
