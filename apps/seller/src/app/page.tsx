import { Card } from "@nova/design-system";

// Temporary — replaced by the real login/dashboard shell in S-2. This just
// proves S-1's wiring: real design tokens and a shared component render
// here, not raw unstyled HTML the way the pre-S-1 stub did.
export default function SellerHomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[color:var(--color-muted)] p-8">
      <Card className="p-6">
        <p className="text-[color:var(--color-foreground)]">Nova Seller</p>
      </Card>
    </main>
  );
}
