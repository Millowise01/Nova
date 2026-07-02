import { FeatureGrid, ModuleShell } from "@/features/shared/components";

const orderModules = [
  { title: "Order History", description: "Complete timeline of customer purchases." },
  { title: "Order Details", description: "Shipment, payment, and item-level breakdown." },
  { title: "Invoice", description: "Tax invoice and downloadable receipts." },
  { title: "Track Order", description: "Fulfillment and shipment status milestones." },
  { title: "Cancel Order", description: "Cancellation logic by fulfillment state." },
  { title: "Return Request", description: "RMA initiation and item-level reasons." },
  { title: "Refund Status", description: "Refund lifecycle and payout status." },
  { title: "Review Purchase", description: "Post-purchase ratings and review flow." },
  { title: "Reorder", description: "One-click reorder from past purchases." }
];

export function OrdersScreen() {
  return (
    <ModuleShell subtitle="Order lifecycle management from placement to return." title="Order Management">
      <FeatureGrid items={orderModules} />
    </ModuleShell>
  );
}
