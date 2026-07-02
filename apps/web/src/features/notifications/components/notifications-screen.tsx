import { FeatureGrid, ModuleShell } from "@/features/shared/components";

const notificationModules = [
  { title: "Notification Center", description: "Unified feed of order, wallet, and campaign updates." },
  { title: "Push Placeholder", description: "Future push notification integration slot." },
  { title: "SMS Placeholder", description: "Future SMS preference and channel support." },
  { title: "Email Preferences", description: "Granular email subscription controls." },
  { title: "Unread Badges", description: "Unread counters across application shell." },
  { title: "Filtering", description: "Channel and priority based filtering controls." }
];

export function NotificationsScreen() {
  return (
    <ModuleShell subtitle="Customer notifications and delivery preferences architecture." title="Notifications">
      <FeatureGrid items={notificationModules} />
    </ModuleShell>
  );
}
