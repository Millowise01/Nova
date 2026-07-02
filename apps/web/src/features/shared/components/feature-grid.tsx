import { Badge, Card } from "@nova/ui";
import type { ModuleCard } from "@/types/domain";

export function FeatureGrid({ items }: { items: ModuleCard[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <Card key={item.title} className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-[color:var(--ds-text)]">{item.title}</h3>
            {item.badge ? <Badge tone="primary">{item.badge}</Badge> : null}
          </div>
          <p className="text-sm text-slate-600">{item.description}</p>
          {item.href ? (
            <a className="text-sm font-semibold text-[color:var(--ds-primary)] hover:underline" href={item.href}>
              Explore
            </a>
          ) : null}
        </Card>
      ))}
    </div>
  );
}
