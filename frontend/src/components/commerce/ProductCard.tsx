import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/domain";
import { Card } from "@/components/ui/Card";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="relative h-44 w-full">
        <Image src={product.image} alt={product.name} fill className="object-cover" />
      </div>
      <div className="space-y-2 p-4">
        <p className="text-xs text-slate-500">{product.brand}</p>
        <h3 className="line-clamp-1 font-semibold">{product.name}</h3>
        <p className="text-sm text-slate-600">Eco Score: {product.ecoScore}/100</p>
        <div className="flex items-center justify-between">
          <p className="font-semibold">SLL {product.priceSll.toLocaleString()}</p>
          <Link href={`/products/${product.slug}`} className="text-sm font-medium text-primary">View</Link>
        </div>
      </div>
    </Card>
  );
}
