"use client";

import { Button, ErrorState } from "@nova/ui";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto w-full max-w-xl px-4 py-16 md:px-6">
      <ErrorState>
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-rose-900/80">We could not complete this action. Please retry.</p>
        <Button className="mt-4" onClick={reset}>
          Retry
        </Button>
      </ErrorState>
    </main>
  );
}
