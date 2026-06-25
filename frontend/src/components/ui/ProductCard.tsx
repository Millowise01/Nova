import { Link } from 'react-router-dom';

import type { Product } from '@/api/products';
import { formatNLE } from '@/utils/formatNLE';

export function ProductCard({ product }: { product: Product }) {
  const image = product.images[0]?.url;

  return (
    <article className="nova-card overflow-hidden">
      <Link to={`/product/${product.slug}`} className="block">
        <div className="aspect-[4/3] bg-gray-100">
          {image ? <img src={image} alt={product.name} className="h-full w-full object-cover" /> : null}
        </div>
        <div className="space-y-2 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-700">{product.category.name}</p>
          <h3 className="line-clamp-2 text-base font-semibold text-gray-900">{product.name}</h3>
          <p className="text-sm text-gray-600">{product.seller.shopName}</p>
          <div className="flex items-center justify-between pt-2">
            <span className="text-base font-bold text-gray-900">{formatNLE(product.price)}</span>
            <span className="text-xs font-semibold text-gray-500">Stock {product.stock}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}