import { notFound } from "next/navigation";
import { getProductsData } from "@/hooks/use-products-data";

export default function ProductDetailsPage({ params }: { params: { slug: string } }) {
  const product = getProductsData().find((item) => item.slug === params.slug);

  if (!product) {
    return notFound();
  }

  const resolvedProduct = product;

  return (
    <main className="space-y-4 py-8">
      <h1 className="text-3xl font-bold">{resolvedProduct.name}</h1>
      <p className="text-slate-600">Brand: {resolvedProduct.brand}</p>
      <p className="text-lg font-semibold">SLL {resolvedProduct.priceSll.toLocaleString()}</p>
      <p className="max-w-2xl text-slate-600">Sustainably sourced product from verified suppliers with transparent traceability.</p>
    </main>
  );
}
