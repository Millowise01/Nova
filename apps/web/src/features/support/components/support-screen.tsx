import { Badge, Card } from "@nova/ui";

import { FeatureGrid, ModuleShell } from "@/features/shared/components";

// None of these have a backend yet — plans, not shipped features. The badge
// and subtitle exist so this page doesn't read as a finished capability.
// Dispute Center used to be listed here too, but it's real now (W-12) — it's
// rendered as its own linked card below, not in this coming-soon grid.
const supportModules = [
  { title: "Help Center", description: "Self-service knowledge base and guides." },
  { title: "FAQs", description: "Frequently asked questions by customer journey." },
  { title: "Live Chat", description: "Real-time support channel placeholder." },
  { title: "Support Tickets", description: "Issue intake and case tracking." },
  { title: "Contact Forms", description: "Structured support request submissions." },
  { title: "Feedback", description: "Experience rating and feedback capture." },
  { title: "Report Seller", description: "Seller misconduct reporting workflow." },
  { title: "Report Product", description: "Product quality and listing issue reports." },
];

export function SupportScreen() {
  return (
    <ModuleShell
      actions={<Badge tone="info">Most of this is coming soon</Badge>}
      subtitle="Dispute Center is real today. The rest of Nova's customer support features are still being planned."
      title="Customer Support"
    >
      <a href="/support/disputes" className="group block">
        <Card className="flex items-center justify-between rounded-xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <div>
            <h3 className="text-base font-bold text-[color:var(--color-foreground)] group-hover:text-[color:var(--color-primary)]">
              Dispute Center
            </h3>
            <p className="mt-1 text-sm text-[color:var(--color-foreground-muted)]">
              View and comment on disputes you&apos;ve opened about an order or a review.
            </p>
          </div>
          <Badge tone="success">Live</Badge>
        </Card>
      </a>

      <FeatureGrid items={supportModules} />
    </ModuleShell>
  );
}
