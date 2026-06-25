export function FilterSidebar() {
  return (
    <aside className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <h3 className="font-semibold">Smart Filters</h3>
      <div>
        <p className="text-sm font-medium">Price Range</p>
        <input type="range" className="mt-2 w-full" aria-label="Price range" />
      </div>
      <div>
        <p className="text-sm font-medium">Eco Score</p>
        <select className="mt-2 w-full rounded-lg border border-slate-300 p-2 text-sm dark:border-slate-700 dark:bg-slate-900">
          <option>70+</option>
          <option>80+</option>
          <option>90+</option>
        </select>
      </div>
    </aside>
  );
}
