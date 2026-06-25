import Link from "next/link";
import { Bell, CreditCard, Heart, LayoutDashboard, MapPin, Package, Shield, Star, User } from "lucide-react";

const navItems = [
  { href: "/account", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/account/profile", label: "Profile", Icon: User },
  { href: "/account/addresses", label: "Addresses", Icon: MapPin },
  { href: "/account/payment-methods", label: "Payment Methods", Icon: CreditCard },
  { href: "/account/order-history", label: "Order History", Icon: Package },
  { href: "/account/wishlist", label: "Wishlist", Icon: Heart },
  { href: "/account/reviews", label: "Reviews", Icon: Star },
  { href: "/account/notifications", label: "Notifications", Icon: Bell },
  { href: "/account/security", label: "Security", Icon: Shield },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <nav className="h-fit rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
        {navItems.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>
      <div>{children}</div>
    </div>
  );
}
