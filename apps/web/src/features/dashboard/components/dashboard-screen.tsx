import { FeatureGrid, ModuleShell } from "@/features/shared/components";

const dashboardModules = [
  { title: "Overview", description: "Summary of account activity and order health." },
  { title: "Orders", description: "Order history, tracking, and invoice access." },
  { title: "Wishlist", description: "Saved products and future purchase tracking." },
  { title: "Wallet", description: "Balance, rewards, and cashback surfaces." },
  { title: "Rewards", description: "Loyalty and campaign participation metrics." },
  { title: "Notifications", description: "Central notification preferences and feed." },
  { title: "Messages", description: "Conversation history with support and sellers." },
  { title: "Addresses", description: "Saved delivery addresses and defaults." },
  { title: "Payment Methods", description: "Saved cards and payment preference routing." },
  { title: "Support Tickets", description: "Issue tracking and dispute history." },
  { title: "Settings & Security", description: "Privacy, password, and connected devices." }
];

export function DashboardScreen() {
  return (
    <ModuleShell subtitle="Customer dashboard modules aligned with account lifecycle flows." title="Customer Dashboard">
      <FeatureGrid items={dashboardModules} />
    </ModuleShell>
  );
}
