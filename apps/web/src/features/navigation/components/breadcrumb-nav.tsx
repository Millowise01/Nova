import { Breadcrumb } from "@nova/ui";

export function BreadcrumbNav({ items }: { items: Array<{ href: string; label: string }> }) {
  return <Breadcrumb items={items.map(({ href, label }) => ({ href, label }))} />;
}
