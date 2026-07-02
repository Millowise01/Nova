import { MainLayout } from "@/components/layouts";
import { ModuleScreen } from "@/features/shared/components";
import { moduleMap } from "@/features/docs/module-map";

export default function CartPage() {
  return (
    <MainLayout>
      <ModuleScreen
        breadcrumb={[{ href: "/", label: "Home" }, { href: "/cart", label: "Cart" }]}
        cards={moduleMap.cart}
        subtitle="Cart workflows support guest persistence, coupons, gift cards, and recommendations."
        title="Shopping Cart"
      />
    </MainLayout>
  );
}
import { MainLayout } from "@/components/layouts";
import { CartScreen } from "@/features/cart/components/cart-screen";

export default function CartPage() {
  return (
    <MainLayout>
      <CartScreen />
    </MainLayout>
  );
}
