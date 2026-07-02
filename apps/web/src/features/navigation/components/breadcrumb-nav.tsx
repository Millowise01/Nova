import Link from "next/link";
import { Breadcrumb } from "@nova/ui";

export function BreadcrumbNav({ items }: { items: Array<{ href: string; label: string }> }) {
  return (
    <Breadcrumb>
      {items.map((item, index) => (
        <li className="text-sm text-slate-600" key={item.href}>
          <Link className="hover:text-[color:var(--ds-primary)]" href={item.href}>
            {item.label}
          </Link>
          {index < items.length - 1 ? <span className="mx-2">/</span> : null}
        </li>
      ))}
    </Breadcrumb>
  );
}
