import Link from "next/link";
import { BarChart2, LayoutDashboard, MessageSquare, Package, ShoppingBag, Tag, AlertTriangle, Boxes } from "lucide-react";

const navItems = [
  { href: "/seller/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/seller/products", label: "Products", Icon: Package },
  { href: "/seller/inventory", label: "Inventory", Icon: Boxes },
  { href: "/seller/orders", label: "Orders", Icon: ShoppingBag },
  { href: "/seller/coupons", label: "Coupons", Icon: Tag },
  { href: "/seller/analytics", label: "Analytics", Icon: BarChart2 },
  { href: "/seller/messages", label: "Messages", Icon: MessageSquare },
  { href: "/seller/disputes", label: "Disputes", Icon: AlertTriangle },
];

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <aside className="hidden w-60 flex-shrink-0 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:flex lg:flex-col">
        <div className="flex h-16 items-center border-b border-slate-200 px-5 dark:border-slate-800">
          <Link href="/" className="text-xl font-bold text-primary">Nova</Link>
          <span className="ml-2 rounded-full bg-secondary/20 px-2 py-0.5 text-xs font-semibold text-slate-700">Seller</span>
        </div>
        <nav className="flex-1 space-y-1 p-3">
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
        <div className="border-t border-slate-200 p-3 dark:border-slate-800">
          <Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 hover:text-primary">
            ← Back to Store
          </Link>
        </div>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center border-b border-slate-200 bg-white px-6 dark:border-slate-800 dark:bg-slate-900 lg:hidden">
          <Link href="/" className="text-xl font-bold text-primary">Nova Seller</Link>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
