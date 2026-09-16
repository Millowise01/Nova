import { Badge } from "@nova/ui";

import { FeatureGrid, ModuleShell } from "@/features/shared/components";

// None of these have a backend yet — plans, not shipped features. The badge
// and subtitle exist so this page doesn't read as a finished capability.
// (Trust & Safety's real dispute endpoints back apps/admin's dispute-review
// screens, not a customer-facing "Dispute Center" here — different surface.)
const supportModules = [
  { title: "Help Center", description: "Self-service knowledge base and guides." },
  { title: "FAQs", description: "Frequently asked questions by customer journey." },
  { title: "Live Chat", description: "Real-time support channel placeholder." },
  { title: "Support Tickets", description: "Issue intake and case tracking." },
  { title: "Contact Forms", description: "Structured support request submissions." },
  { title: "Feedback", description: "Experience rating and feedback capture." },
  { title: "Report Seller", description: "Seller misconduct reporting workflow." },
  { title: "Report Product", description: "Product quality and listing issue reports." },
  { title: "Dispute Center", description: "Escalation and dispute resolution center." },
];

export function SupportScreen() {
  return (
    <ModuleShell
      actions={<Badge tone="info">Coming soon</Badge>}
      subtitle="We're planning customer support features for Nova — none of this is built yet."
      title="Customer Support"
    >
      <FeatureGrid items={supportModules} />
    </ModuleShell>
  );
}
