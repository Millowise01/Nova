import Link from "next/link";

const footerColumns = [
  {
    title: "Shop",
    links: [
      { href: "/categories", label: "Categories" },
      { href: "/deals", label: "Daily Deals" },
      { href: "/new-arrivals", label: "New Arrivals" }
    ]
  },
  {
    title: "Account",
    links: [
      { href: "/account", label: "Dashboard" },
      { href: "/orders", label: "Orders" },
      { href: "/wallet", label: "Wallet" }
    ]
  },
  {
    title: "Support",
    links: [
      { href: "/support/help-center", label: "Help Center" },
      { href: "/support/faqs", label: "FAQs" },
      { href: "/support/contact", label: "Contact" }
    ]
  }
];

export function MainFooter() {
  return (
    <footer className="border-t border-[color:var(--ds-border)] bg-[color:var(--ds-surface)]">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-10 md:grid-cols-4 md:px-6 lg:px-8">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Nova</h3>
          <p className="text-sm text-slate-600">Sierra Leone's digital commerce ecosystem for trusted shopping.</p>
        </div>
        {footerColumns.map((column) => (
          <div key={column.title}>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-900">{column.title}</h4>
            <ul className="mt-3 space-y-2">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link className="text-sm text-slate-600 hover:text-[color:var(--ds-primary)]" href={link.href}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}
