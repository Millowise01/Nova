import { MainLayout } from "@/components/layouts";
import { ModuleScreen } from "@/features/shared/components";
import { moduleMap } from "@/features/docs/module-map";

export default function CheckoutPage() {
  return (
    <MainLayout>
      <ModuleScreen
        breadcrumb={[{ href: "/", label: "Home" }, { href: "/checkout", label: "Checkout" }]}
        cards={moduleMap.checkout}
        subtitle="Five-step checkout architecture with guest support, saved data, and payment placeholders."
        title="Checkout Flow"
      />
    </MainLayout>
  );
}
import { CheckoutFlow } from "@/features/checkout/components/checkout-flow";

export default function CheckoutPage() {
  return <CheckoutFlow />;
}
