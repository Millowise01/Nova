import { FeatureGrid, ModuleShell } from "@/features/shared/components";

const aiModules = [
  { title: "Chat Assistant", description: "Conversational storefront assistant shell." },
  { title: "Product Comparison", description: "Side-by-side product intelligence interface." },
  { title: "Smart Recommendations", description: "Intent-aware recommendation UI." },
  { title: "Gift Finder", description: "Occasion and budget-guided suggestion flow." },
  { title: "Shopping Lists", description: "AI-assisted list generation and optimization." },
  { title: "Outfit Suggestions", description: "Multi-item coordination recommendation surface." }
];

export function AIScreen() {
  return (
    <ModuleShell subtitle="AI shopping interfaces designed for future endpoint integration." title="AI Shopping Assistant">
      <FeatureGrid items={aiModules} />
    </ModuleShell>
  );
}
