import { Card } from "@nova/ui";
import type { Brand } from "@/types/domain";
import { SectionTitle } from "@/features/shared/components";

export function BrandsSection({ brands }: { brands: Brand[] }) {
  return (
    <section className="mx-auto w-full max-w-7xl space-y-4 px-4 md:px-6 lg:px-8">
      <SectionTitle description="Global and local brands trusted by the Nova customer community." title="Popular Brands" />
      <div className="grid gap-4 sm:grid-cols-3">
        {brands.map((brand) => (
          <Card className="flex items-center justify-between gap-3" key={brand.id}>
            <h3 className="text-sm font-semibold">{brand.name}</h3>
            <span className="text-xs uppercase tracking-wide text-slate-500">Verified</span>
          </Card>
        ))}
      </div>
    </section>
  );
}
