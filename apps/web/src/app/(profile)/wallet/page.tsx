import { MainLayout } from "@/components/layouts";
import { ModuleScreen } from "@/features/shared/components";
import { moduleMap } from "@/features/docs/module-map";

export default function WalletPage() {
  return (
    <MainLayout>
      <ModuleScreen
        breadcrumb={[{ href: "/", label: "Home" }, { href: "/wallet", label: "Wallet" }]}
        cards={moduleMap.wallet}
        subtitle="Wallet UI modules for balance, transactions, rewards, and coupon value flows."
        title="Wallet"
      />
    </MainLayout>
  );
}
import { WalletScreen } from "@/features/wallet/components/wallet-screen";

export default function WalletPage() {
  return <WalletScreen />;
}
