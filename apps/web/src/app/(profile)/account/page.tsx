import { MainLayout } from "@/components/layouts";
import { ModuleScreen } from "@/features/shared/components";
import { moduleMap } from "@/features/docs/module-map";

export default function AccountPage() {
  return (
    <MainLayout>
      <ModuleScreen
        breadcrumb={[{ href: "/", label: "Home" }, { href: "/account", label: "Account" }]}
        cards={moduleMap.dashboard}
        subtitle="Customer dashboard modules for orders, rewards, notifications, and account management."
        title="Customer Dashboard"
      />
    </MainLayout>
  );
}
import { DashboardScreen } from "@/features/dashboard/components/dashboard-screen";

export default function AccountPage() {
  return <DashboardScreen />;
}
