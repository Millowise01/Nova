const categories = ["Fashion", "Home", "Electronics", "Organic Food", "Beauty", "Health"];

export default function CategoriesPage() {
  return (
    <main className="space-y-6 py-6">
      <h1 className="text-3xl font-bold">Categories</h1>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <div key={category} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
            <p className="font-medium">{category}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
