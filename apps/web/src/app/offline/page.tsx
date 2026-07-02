"use client";

import { Button, EmptyState } from "@nova/ui";
import { useNetworkStatus } from "@/hooks/use-network-status";

export default function OfflinePage() {
  const isOnline = useNetworkStatus();

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-16 md:px-6">
      <EmptyState>
        <h1 className="text-xl font-semibold">You are offline</h1>
        <p className="mt-2 text-sm text-slate-600">Cached content is available. Retry once your network returns.</p>
        <Button disabled={isOnline} onClick={() => window.location.reload()}>
          Retry Connection
        </Button>
      </EmptyState>
    </main>
  );
}
