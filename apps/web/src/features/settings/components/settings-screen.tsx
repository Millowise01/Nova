import { Badge, Card, CardBody } from "@nova/ui";

import { ProfileCard } from "@/features/account/components/profile-card";
import { FeatureGrid, ModuleShell } from "@/features/shared/components";

import { DarkModeToggle } from "./dark-mode-toggle";

// "Profile" is real (below), and so is Dark Mode now (W-13, via the DarkModeToggle
// card) — removed from the placeholder grid. Re-checked against the live route table
// before assuming the rest still need backend work (W-14): they genuinely do
// (currency display, privacy controls, MFA/session management, notification routing,
// connected devices, account deletion) and stay as placeholders.
const settingsModules = [
  { title: "Currency", description: "Regional pricing display options." },
  { title: "Privacy", description: "Data visibility and profile privacy controls." },
  { title: "Security", description: "Password, MFA, and session controls." },
  { title: "Notification Preferences", description: "Message channel preference routing." },
  { title: "Connected Devices", description: "Active device session management." },
  { title: "Delete Account", description: "Account deletion and data portability flow." },
];

export function SettingsScreen() {
  return (
    <ModuleShell
      subtitle="Customer account settings and privacy/security control center."
      title="Settings"
    >
      <div className="space-y-6">
        <ProfileCard />
        <Card>
          <CardBody>
            <DarkModeToggle />
          </CardBody>
        </Card>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-700">More settings</h2>
            <Badge tone="info">Coming soon</Badge>
          </div>
          <FeatureGrid items={settingsModules} />
        </div>
      </div>
    </ModuleShell>
  );
}
