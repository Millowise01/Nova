"use client";

import { useQuery } from "@tanstack/react-query";
import { Input, Spinner } from "@nova/ui";
import { FeatureGrid, ModuleShell } from "@/features/shared/components";

const searchModules = [
  { title: "Instant Search", description: "Low-latency result updates while typing." },
  { title: "Autocomplete", description: "Suggestions for products, categories, and sellers." },
  { title: "Recent Searches", description: "Personalized search memory for quick repeat queries." },
  { title: "Trending Searches", description: "Trending intent signals and campaign phrases." },
  { title: "Voice Search", description: "Voice entry placeholder with future API integration." },
  { title: "Search History", description: "Search timeline and quick restore actions." }
];

export function SearchScreen() {
  const query = useQuery({
    queryKey: ["search", "trending"],
    queryFn: async () => ["smartphone", "air fryer", "solar lamp", "running shoes"]
  });

  return (
    <ModuleShell subtitle="Enterprise search architecture with extensible AI-ready touchpoints." title="Search Experience">
      <Input placeholder="Search products, sellers, categories" type="search" />
      {query.isLoading ? (
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Spinner className="h-4 w-4" /> Loading search signals...
        </div>
      ) : (
        <div className="text-sm text-slate-600">Trending now: {query.data?.join(", ")}</div>
      )}
      <FeatureGrid items={searchModules} />
    </ModuleShell>
  );
}
