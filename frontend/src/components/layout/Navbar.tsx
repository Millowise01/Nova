"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Moon, Search, ShoppingCart, Sun, User, X } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { useUiStore } from "@/store/ui-store";
import { formatSll } from "@/lib/format";
import { cn } from "@/lib/utils";

const publicLinks = [
  { href: "/home", label: "Home" },
  { href: "/catalog", label: "Shop" },
  { href: "/categories", label: "Categories" },
  { href: "/deals", label: "Deals" },
  { href: "/eco-products", label: "Eco" },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, role } = useAuthStore();
  const itemCount = useCartStore((s) => s.itemCount());
  const { theme, toggleTheme, setGlobalSearchOpen, mobileMenuOpen, setMobileMenuOpen, setCartDrawerOpen } = useUiStore();

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 lg:px-6">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-primary dark:text-primary">
            Nova
          </Link>

          {/* Desktop links */}
          <div className="hidden items-center gap-1 md:flex">
            {publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-primary/10 text-primary"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white",
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1.5">
            <button
              aria-label="Open global search"
              onClick={() => setGlobalSearchOpen(true)}
              className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Search size={17} />
            </button>

            <button
              aria-label="Toggle theme"
              onClick={toggleTheme}
              className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            <button
              aria-label="Open cart"
              onClick={() => setCartDrawerOpen(true)}
              className="relative rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <ShoppingCart size={17} />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </button>

            {isAuthenticated && user ? (
              <Link
                href={role === "admin" ? "/admin" : role === "seller" ? "/seller/dashboard" : "/account"}
                className="hidden items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800 md:flex"
              >
                <User size={15} />
                <span>{user.firstName}</span>
              </Link>
            ) : (
              <div className="hidden items-center gap-2 md:flex">
                <Link href="/auth/login" className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
                  Login
                </Link>
                <Link href="/auth/signup" className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              className="rounded-xl border border-slate-200 p-2 md:hidden dark:border-slate-700"
              aria-label="Toggle menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-t border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-950 md:hidden">
            <div className="space-y-1">
              {publicLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="mt-4 flex gap-2 border-t border-slate-200 pt-4 dark:border-slate-800">
              {isAuthenticated ? (
                <Link href="/account" onClick={() => setMobileMenuOpen(false)} className="flex-1 rounded-xl bg-primary py-2.5 text-center text-sm font-semibold text-white">
                  My Account
                </Link>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)} className="flex-1 rounded-xl border border-slate-300 py-2.5 text-center text-sm font-medium dark:border-slate-700">
                    Login
                  </Link>
                  <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)} className="flex-1 rounded-xl bg-primary py-2.5 text-center text-sm font-semibold text-white">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <CartDrawer />
    </>
  );
}

function CartDrawer() {
  const { cartDrawerOpen, setCartDrawerOpen } = useUiStore();
  const { items, updateQuantity, removeItem, subtotal } = useCartStore();
  return (
    <div className={cn("fixed inset-0 z-[110]", cartDrawerOpen ? "pointer-events-auto" : "pointer-events-none")}>
      <div
        className={cn("absolute inset-0 bg-slate-900/50 transition-opacity", cartDrawerOpen ? "opacity-100" : "opacity-0")}
        onClick={() => setCartDrawerOpen(false)}
      />
      <aside
        className={cn(
          "absolute right-0 top-0 flex h-full w-full max-w-sm flex-col bg-white shadow-2xl transition-transform dark:bg-slate-950",
          cartDrawerOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 dark:border-slate-800">
          <h2 className="font-semibold">Cart ({items.length})</h2>
          <button onClick={() => setCartDrawerOpen(false)} aria-label="Close cart" className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <ShoppingCart size={40} className="mb-3 text-slate-300" />
              <p className="font-medium text-slate-600">Your cart is empty</p>
              <p className="mt-1 text-sm text-slate-400">Add products to continue</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex gap-3">
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
                    {product.images[0] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.images[0].url} alt={product.name} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="line-clamp-1 text-sm font-medium">{product.name}</p>
                    <p className="text-sm text-primary">{formatSll(product.priceSll)}</p>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQuantity(product.id, quantity - 1)} className="flex h-6 w-6 items-center justify-center rounded border border-slate-300 text-xs">−</button>
                      <span className="text-sm">{quantity}</span>
                      <button onClick={() => updateQuantity(product.id, quantity + 1)} className="flex h-6 w-6 items-center justify-center rounded border border-slate-300 text-xs">+</button>
                      <button onClick={() => removeItem(product.id)} className="ml-auto text-xs text-error">Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-slate-200 px-4 py-4 dark:border-slate-800">
            <div className="mb-3 flex justify-between text-sm">
              <span className="text-slate-600">Subtotal</span>
              <span className="font-semibold">{formatSll(subtotal())}</span>
            </div>
            <Link
              href="/checkout"
              onClick={() => setCartDrawerOpen(false)}
              className="block w-full rounded-xl bg-primary py-3 text-center text-sm font-semibold text-white hover:bg-primary/90"
            >
              Checkout
            </Link>
            <Link
              href="/cart"
              onClick={() => setCartDrawerOpen(false)}
              className="mt-2 block w-full rounded-xl border border-slate-300 py-3 text-center text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-900"
            >
              View full cart
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}
