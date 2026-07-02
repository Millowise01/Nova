import { FeatureGrid, ModuleShell } from "@/features/shared/components";

const sustainabilityModules = [
  { title: "Impact Dashboard", description: "Environmental impact metrics across purchases." },
  { title: "Recycling Rewards", description: "Reward pathways for recyclable purchases." },
  { title: "Carbon Savings", description: "Carbon offset and low-impact purchase tracking." },
  { title: "Eco Score", description: "Product-level sustainability scoring model." },
  { title: "Environmental Badges", description: "Visual trust indicators in catalog and PDP." },
  { title: "Donation History", description: "Climate and community donation timeline." },
  { title: "Community Impact", description: "Aggregate social impact transparency metrics." }
];

export function SustainabilityScreen() {
  return (
    <ModuleShell subtitle="Sustainability experiences integrated into core customer journeys." title="Sustainability">
      <FeatureGrid items={sustainabilityModules} />
    </ModuleShell>
  );
}
