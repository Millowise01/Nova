import { Badge } from "@nova/ui";

import { FeatureGrid, ModuleShell } from "@/features/shared/components";

// None of these have a backend yet — plans, not shipped features. The badge
// and subtitle exist so this page doesn't read as a finished capability.
const sustainabilityModules = [
  { title: "Impact Dashboard", description: "Environmental impact metrics across purchases." },
  { title: "Recycling Rewards", description: "Reward pathways for recyclable purchases." },
  { title: "Carbon Savings", description: "Carbon offset and low-impact purchase tracking." },
  { title: "Eco Score", description: "Product-level sustainability scoring model." },
  { title: "Environmental Badges", description: "Visual trust indicators in catalog and PDP." },
  { title: "Donation History", description: "Climate and community donation timeline." },
  { title: "Community Impact", description: "Aggregate social impact transparency metrics." },
];

export function SustainabilityScreen() {
  return (
    <ModuleShell
      actions={<Badge tone="info">Coming soon</Badge>}
      subtitle="We're planning sustainability features for Nova — none of this is built yet."
      title="Sustainability"
    >
      <FeatureGrid items={sustainabilityModules} />
    </ModuleShell>
  );
}
