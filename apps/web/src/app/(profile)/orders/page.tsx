import { MainLayout } from "@/components/layouts";
import { ModuleScreen } from "@/features/shared/components";
import { moduleMap } from "@/features/docs/module-map";

export default function OrdersPage() {
  return (
    <MainLayout>
      <ModuleScreen
        breadcrumb={[{ href: "/", label: "Home" }, { href: "/orders", label: "Orders" }]}
        cards={moduleMap.orders}
        subtitle="Order lifecycle coverage includes invoice, tracking, cancellation, returns, and reorder actions."
        title="Order Management"
      />
    </MainLayout>
  );
}
import { OrdersScreen } from "@/features/orders/components/orders-screen";

export default function OrdersPage() {
  return <OrdersScreen />;
}
