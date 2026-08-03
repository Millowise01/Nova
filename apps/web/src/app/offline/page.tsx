"use client";

import { Button, EmptyState } from "@nova/ui";

import { useNetworkStatus } from "@/hooks/use-network-status";

export default function OfflinePage() {
  const isOnline = useNetworkStatus();

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-16 md:px-6">
      <EmptyState
        title="You are offline"
        description="Cached content is available. Retry once your network returns."
      >
        <Button disabled={isOnline} onClick={() => window.location.reload()}>
          Retry Connection
        </Button>
      </EmptyState>
    </main>
  );
}
