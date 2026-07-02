import { FeatureGrid, ModuleShell } from "@/features/shared/components";

const offlineModules = [
  { title: "Offline Page", description: "Dedicated offline fallback route." },
  { title: "Retry Actions", description: "Retry UX for failed network requests." },
  { title: "Cached Pages", description: "Fallback shell for cached route data." },
  { title: "Network Detection", description: "Online/offline detection hook integration." },
  { title: "Graceful Degradation", description: "Non-critical feature fallback handling." }
];

export function OfflineScreen() {
  return (
    <ModuleShell subtitle="Offline resilience architecture for unstable connectivity scenarios." title="Offline Experience">
      <FeatureGrid items={offlineModules} />
    </ModuleShell>
  );
}
