import { MainLayout } from "@/components/layouts";
import { ModuleScreen } from "@/features/shared/components";
import { moduleMap } from "@/features/docs/module-map";

export default function SettingsPage() {
  return (
    <MainLayout>
      <ModuleScreen
        breadcrumb={[{ href: "/", label: "Home" }, { href: "/settings", label: "Settings" }]}
        cards={moduleMap.settings}
        subtitle="Settings architecture covers profile, privacy, notifications, localization, and account deletion flows."
        title="Settings"
      />
    </MainLayout>
  );
}
import { SettingsScreen } from "@/features/settings/components/settings-screen";

export default function SettingsPage() {
  return <SettingsScreen />;
}
