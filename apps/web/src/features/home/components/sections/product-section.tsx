import Link from "next/link";
import { Badge, Button, Card } from "@nova/ui";
import type { Product } from "@/types/domain";
import { SectionTitle } from "@/features/shared/components";

export function ProductSection({ title, description, products }: { title: string; description: string; products: Product[] }) {
  return (
    <section className="mx-auto w-full max-w-7xl space-y-4 px-4 md:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <SectionTitle description={description} title={title} />
        <Link href="/categories">
          <Button variant="ghost">View all</Button>
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {products.map((product) => (
          <Card className="space-y-3" key={product.id}>
            <div className="flex items-center justify-between gap-2">
              <Badge tone="neutral">{product.category}</Badge>
              {product.ecoScore ? <Badge tone="success">Eco {product.ecoScore}</Badge> : null}
            </div>
            <h3 className="text-base font-semibold text-[color:var(--ds-text)]">{product.title}</h3>
            <p className="text-sm text-slate-600">{product.sellerName}</p>
            <div className="flex items-center justify-between gap-3">
              <p className="text-base font-semibold">{product.price.formatted}</p>
              <Button size="sm">Add</Button>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
