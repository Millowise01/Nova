import Link from "next/link";

import type { BrandResponse } from "@nova/validation";

import { SectionTitle } from "@/features/shared/components";

export function BrandsSection({ brands }: { brands: BrandResponse[] }) {
  return (
    <section className="mx-auto w-full max-w-7xl space-y-5 px-4 md:px-6 lg:px-8">
      <div className="flex items-end justify-between gap-3">
        <SectionTitle
          description="Global and local brands trusted by the Nova community."
          title="Popular Brands"
        />
        <Link
          href="/brands"
          className="shrink-0 text-sm font-semibold text-[color:var(--color-accent)] hover:underline"
        >
          All brands →
        </Link>
      </div>

      {/* Scrollable strip */}
      <div className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {brands.map((brand) => (
          <Link
            key={brand.id}
            href={`/brands/${brand.slug ?? brand.id}`}
            className="flex shrink-0 items-center gap-2.5 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-2.5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[color:var(--color-primary)] hover:shadow-md"
          >
            {/* Brand initial avatar */}
            <span
              aria-hidden="true"
              className="flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--color-primary)] text-xs font-bold text-[color:var(--color-primary-foreground)]"
            >
              {brand.name.charAt(0).toUpperCase()}
            </span>
            <span className="whitespace-nowrap text-sm font-semibold text-[color:var(--color-foreground)]">
              {brand.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
