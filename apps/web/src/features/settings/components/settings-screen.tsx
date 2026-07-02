import { FeatureGrid, ModuleShell } from "@/features/shared/components";

const settingsModules = [
  { title: "Profile", description: "Personal profile and contact details." },
  { title: "Language", description: "Localization and language preferences." },
  { title: "Currency", description: "Regional pricing display options." },
  { title: "Dark Mode", description: "Theme mode preferences and persistence." },
  { title: "Privacy", description: "Data visibility and profile privacy controls." },
  { title: "Security", description: "Password, MFA, and session controls." },
  { title: "Notification Preferences", description: "Message channel preference routing." },
  { title: "Connected Devices", description: "Active device session management." },
  { title: "Delete Account", description: "Account deletion and data portability flow." }
];

export function SettingsScreen() {
  return (
    <ModuleShell subtitle="Customer account settings and privacy/security control center." title="Settings">
      <FeatureGrid items={settingsModules} />
    </ModuleShell>
  );
}
