import { Badge } from "@nova/ui";

import { FeatureGrid, ModuleShell } from "@/features/shared/components";

// None of these have a backend yet — plans, not shipped features. The badge
// and subtitle exist so this page doesn't read as a finished capability.
const aiModules = [
  { title: "Chat Assistant", description: "Conversational storefront assistant shell." },
  { title: "Product Comparison", description: "Side-by-side product intelligence interface." },
  { title: "Smart Recommendations", description: "Intent-aware recommendation UI." },
  { title: "Gift Finder", description: "Occasion and budget-guided suggestion flow." },
  { title: "Shopping Lists", description: "AI-assisted list generation and optimization." },
  { title: "Outfit Suggestions", description: "Multi-item coordination recommendation surface." },
];

export function AIScreen() {
  return (
    <ModuleShell
      actions={<Badge tone="info">Coming soon</Badge>}
      subtitle="We're planning AI shopping features for Nova — none of this is built yet."
      title="AI Shopping Assistant"
    >
      <FeatureGrid items={aiModules} />
    </ModuleShell>
  );
}
