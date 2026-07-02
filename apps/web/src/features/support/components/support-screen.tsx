import { FeatureGrid, ModuleShell } from "@/features/shared/components";

const supportModules = [
  { title: "Help Center", description: "Self-service knowledge base and guides." },
  { title: "FAQs", description: "Frequently asked questions by customer journey." },
  { title: "Live Chat", description: "Real-time support channel placeholder." },
  { title: "Support Tickets", description: "Issue intake and case tracking." },
  { title: "Contact Forms", description: "Structured support request submissions." },
  { title: "Feedback", description: "Experience rating and feedback capture." },
  { title: "Report Seller", description: "Seller misconduct reporting workflow." },
  { title: "Report Product", description: "Product quality and listing issue reports." },
  { title: "Dispute Center", description: "Escalation and dispute resolution center." }
];

export function SupportScreen() {
  return (
    <ModuleShell subtitle="Support operations and self-service systems for the customer lifecycle." title="Customer Support">
      <FeatureGrid items={supportModules} />
    </ModuleShell>
  );
}
