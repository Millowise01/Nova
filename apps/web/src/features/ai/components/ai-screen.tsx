import { Badge } from "@nova/ui";

import { FeatureGrid, ModuleShell } from "@/features/shared/components";

import { AiChat } from "./ai-chat";

// Chat Assistant is real now (Tier 2, ADR-0005) — product discovery, comparison, and
// policy questions all go through it, so "Product Comparison" is folded into the chat
// rather than kept as a separate placeholder. The rest genuinely have no backend yet
// (Volume 4's own staged-maturity model puts a trained recommendation/ranking model,
// gift-finding, and multi-item coordination well past this Stage 0 pass) and stay
// honestly labeled as plans, not shipped features.
const aiModules = [
  { title: "Smart Recommendations", description: "Intent-aware recommendation UI." },
  { title: "Gift Finder", description: "Occasion and budget-guided suggestion flow." },
  { title: "Shopping Lists", description: "AI-assisted list generation and optimization." },
  { title: "Outfit Suggestions", description: "Multi-item coordination recommendation surface." },
];

export function AIScreen() {
  return (
    <ModuleShell
      subtitle="Ask the assistant about products, comparisons, shipping, returns, or payment. The rest of Nova's AI shopping features are still being planned."
      title="AI Shopping Assistant"
    >
      <div className="space-y-6">
        <AiChat />
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-700">More AI features</h2>
            <Badge tone="info">Coming soon</Badge>
          </div>
          <FeatureGrid items={aiModules} />
        </div>
      </div>
    </ModuleShell>
  );
}
