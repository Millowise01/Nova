"use client";

export default function DashboardHomePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-[color:var(--color-foreground)]">Overview</h1>
        <p className="text-sm text-[color:var(--color-foreground-muted)]">
          Welcome to Nova Seller. More here as each area (KYC, catalog, disputes) is built out.
        </p>
      </div>
    </div>
  );
}
