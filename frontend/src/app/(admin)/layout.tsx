import Link from "next/link";
import { BarChart2, FileText, LayoutDashboard, Leaf, Package, Settings, ShieldCheck, ShoppingBag, Tag, Truck, Users, Star, CreditCard, ClipboardList } from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", Icon: Users },
  { href: "/admin/sellers", label: "Sellers", Icon: ShieldCheck },
  { href: "/admin/products", label: "Products", Icon: Package },
  { href: "/admin/categories", label: "Categories", Icon: Tag },
  { href: "/admin/orders", label: "Orders", Icon: ShoppingBag },
  { href: "/admin/payments", label: "Payments", Icon: CreditCard },
  { href: "/admin/delivery-monitoring", label: "Delivery", Icon: Truck },
  { href: "/admin/reviews-moderation", label: "Reviews", Icon: Star },
  { href: "/admin/cms", label: "CMS", Icon: FileText },
  { href: "/admin/sustainability-reports", label: "Sustainability", Icon: Leaf },
  { href: "/admin/analytics-center", label: "Analytics", Icon: BarChart2 },
  { href: "/admin/audit-logs", label: "Audit Logs", Icon: ClipboardList },
  { href: "/admin/settings", label: "Settings", Icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <aside className="hidden w-64 flex-shrink-0 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:flex lg:flex-col">
        <div className="flex h-16 items-center border-b border-slate-200 px-5 dark:border-slate-800">
          <Link href="/" className="text-xl font-bold text-primary">Nova</Link>
          <span className="ml-2 rounded-full bg-error/10 px-2 py-0.5 text-xs font-semibold text-error">Admin</span>
        </div>
        <nav className="flex-1 overflow-y-auto space-y-0.5 p-3">
          {navItems.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            >
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-slate-200 p-3 dark:border-slate-800">
          <Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-500 hover:text-primary">
            ← Back to Store
          </Link>
        </div>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center border-b border-slate-200 bg-white px-6 dark:border-slate-800 dark:bg-slate-900 lg:hidden">
          <Link href="/" className="text-xl font-bold text-primary">Nova Admin</Link>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
