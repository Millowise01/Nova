import { EmptyState } from "@/components/ui/PageState";

export default function CartPage() {
  return (
    <main className="space-y-6 py-6">
      <h1 className="text-3xl font-bold">Shopping Cart</h1>
      <EmptyState title="Your cart is ready" message="Add products and continue to checkout." />
    </main>
  );
}
