import { FeatureGrid, ModuleShell } from "@/features/shared/components";

const cartModules = [
  { title: "Persistent Cart", description: "Cross-session cart synchronization for signed users." },
  { title: "Guest Cart", description: "Local-first cart storage for anonymous shoppers." },
  { title: "Saved for Later", description: "Deferred purchase queue with quick restore." },
  { title: "Coupons & Gift Cards", description: "Promotion and voucher application framework." },
  { title: "Shipping Estimates", description: "Live shipping quote placeholders and thresholds." },
  { title: "Recommended Products", description: "Cross-sell suggestions based on cart context." }
];

export function CartScreen() {
  return (
    <ModuleShell subtitle="Cart architecture built for conversion and retention." title="Shopping Cart">
      <FeatureGrid items={cartModules} />
    </ModuleShell>
  );
}
