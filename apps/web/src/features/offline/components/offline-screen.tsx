import { Badge } from "@nova/ui";

import { FeatureGrid, ModuleShell } from "@/features/shared/components";

// None of these have a backend yet — plans, not shipped features. The badge
// and subtitle exist so this page doesn't read as a finished capability.
const offlineModules = [
  { title: "Offline Page", description: "Dedicated offline fallback route." },
  { title: "Retry Actions", description: "Retry UX for failed network requests." },
  { title: "Cached Pages", description: "Fallback shell for cached route data." },
  { title: "Network Detection", description: "Online/offline detection hook integration." },
  { title: "Graceful Degradation", description: "Non-critical feature fallback handling." },
];

export function OfflineScreen() {
  return (
    <ModuleShell
      actions={<Badge tone="info">Coming soon</Badge>}
      subtitle="We're planning offline resilience for Nova — none of this is built yet."
      title="Offline Experience"
    >
      <FeatureGrid items={offlineModules} />
    </ModuleShell>
  );
}
