import { SearchBar } from "@/components/commerce/SearchBar";

export default function SearchPage() {
  return (
    <main className="space-y-6 py-6">
      <h1 className="text-3xl font-bold">Search Results</h1>
      <SearchBar />
      <p className="text-sm text-slate-600">Search results will appear with smart filtering and AI-assisted relevance ranking.</p>
    </main>
  );
}
