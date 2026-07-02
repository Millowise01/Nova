import { MainLayout } from "@/components/layouts";
import { ModuleScreen } from "@/features/shared/components";
import { moduleMap } from "@/features/docs/module-map";

export default function SupportPage() {
  return (
    <MainLayout>
      <ModuleScreen
        breadcrumb={[{ href: "/", label: "Home" }, { href: "/support", label: "Support" }]}
        cards={moduleMap.support}
        subtitle="Customer support stack includes FAQs, live chat placeholders, tickets, and dispute management."
        title="Customer Support"
      />
    </MainLayout>
  );
}
import { SupportScreen } from "@/features/support/components/support-screen";

export default function SupportPage() {
  return <SupportScreen />;
}
