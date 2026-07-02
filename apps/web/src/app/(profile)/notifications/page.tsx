import { MainLayout } from "@/components/layouts";
import { ModuleScreen } from "@/features/shared/components";
import { moduleMap } from "@/features/docs/module-map";

export default function NotificationsPage() {
  return (
    <MainLayout>
      <ModuleScreen
        breadcrumb={[{ href: "/", label: "Home" }, { href: "/notifications", label: "Notifications" }]}
        cards={moduleMap.notifications}
        subtitle="Notification center supports channel preferences, unread badges, and segmentation."
        title="Notifications"
      />
    </MainLayout>
  );
}
import { NotificationsScreen } from "@/features/notifications/components/notifications-screen";

export default function NotificationsPage() {
  return <NotificationsScreen />;
}
