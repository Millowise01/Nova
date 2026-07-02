import { FeatureGrid, ModuleShell } from "@/features/shared/components";

const walletModules = [
  { title: "Balance", description: "Real-time account balance snapshot." },
  { title: "Transactions", description: "Credit/debit movement ledger." },
  { title: "Top-up", description: "Add funds through cards and mobile money." },
  { title: "Withdraw", description: "Cash-out and transfer workflows." },
  { title: "Rewards", description: "Loyalty reward pool and conversion options." },
  { title: "Cashback", description: "Earned and pending cashback visibility." },
  { title: "Coupons", description: "Stored coupon inventory." },
  { title: "History", description: "Extended wallet timeline and exports." }
];

export function WalletScreen() {
  return (
    <ModuleShell subtitle="Wallet capabilities powering Nova payments and incentives." title="Nova Wallet">
      <FeatureGrid items={walletModules} />
    </ModuleShell>
  );
}
