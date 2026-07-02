import { MainLayout } from "@/components/layouts";
import { ModuleScreen } from "@/features/shared/components";
import { moduleMap } from "@/features/docs/module-map";

export default function SustainabilityPage() {
  return (
    <MainLayout>
      <ModuleScreen
        breadcrumb={[{ href: "/", label: "Home" }, { href: "/sustainability", label: "Sustainability" }]}
        cards={moduleMap.sustainability}
        subtitle="Environmental impact modules track savings, rewards, and community contributions."
        title="Sustainability"
      />
    </MainLayout>
  );
}
import { SustainabilityScreen } from "@/features/sustainability/components/sustainability-screen";

export default function SustainabilityPage() {
  return <SustainabilityScreen />;
}
