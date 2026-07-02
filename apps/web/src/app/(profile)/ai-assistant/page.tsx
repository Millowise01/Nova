import { MainLayout } from "@/components/layouts";
import { ModuleScreen } from "@/features/shared/components";
import { moduleMap } from "@/features/docs/module-map";

export default function AiAssistantPage() {
  return (
    <MainLayout>
      <ModuleScreen
        breadcrumb={[{ href: "/", label: "Home" }, { href: "/ai-assistant", label: "AI Assistant" }]}
        cards={moduleMap.ai}
        subtitle="AI interfaces are architected for future endpoint integration without redesigning UX shells."
        title="AI Shopping Assistant"
      />
    </MainLayout>
  );
}
import { AIScreen } from "@/features/ai/components/ai-screen";

export default function AIAssistantPage() {
  return <AIScreen />;
}
