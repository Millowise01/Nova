const brands = ["EcoLight", "BoFarm", "GreenRoot", "Freetown Threads", "Salone Organics"];

export default function BrandsPage() {
  return (
    <main className="space-y-6 py-6">
      <h1 className="text-3xl font-bold">Brands</h1>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {brands.map((brand) => (
          <article key={brand} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
            <p className="font-medium">{brand}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
