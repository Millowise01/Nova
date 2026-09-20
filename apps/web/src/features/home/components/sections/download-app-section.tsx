import { Button, Card } from "@nova/ui";

export function DownloadAppSection() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8">
      <Card className="grid gap-5 rounded-xl md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <h2 className="text-2xl font-semibold text-[color:var(--color-foreground)]">
            Take Nova everywhere
          </h2>
          <p className="mt-1 text-sm text-[color:var(--color-foreground-muted)]">
            Native mobile apps are coming soon with synced cart, wallet, and personalized assistant.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button disabled variant="outline">
            iOS Preview
          </Button>
          <Button disabled variant="outline">
            Android Preview
          </Button>
        </div>
      </Card>
    </section>
  );
}
