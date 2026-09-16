import { Badge, Card } from "@nova/design-system";

// Analytics and Marketing are Phase 3+ bounded contexts (backend/docs/00-
// bounded-contexts.md) — no backend exists for either yet. Honest "coming
// soon" placeholder, matching the standard apps/web already applies to its
// own unbuilt sections (/sustainability, /ai-assistant, etc.) — no charts,
// no invented numbers, nothing here implies real data.
export function AnalyticsScreen() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-[color:var(--color-foreground)]">Analytics</h1>
          <p className="text-sm text-[color:var(--color-foreground-muted)]">
            Sales performance, traffic, and customer insights for your storefront.
          </p>
        </div>
        <Badge tone="info">Coming soon</Badge>
      </div>

      <Card className="text-sm text-[color:var(--color-foreground-muted)]">
        We&apos;re planning analytics and marketing tools for sellers — nothing here is built yet.
      </Card>
    </div>
  );
}
