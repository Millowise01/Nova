"use client";

import Link from "next/link";

import { Badge, Button, Card, EmptyState, ErrorState, Spinner } from "@nova/ui";

import { useMyDisputesQuery } from "../trust-safety.queries";

function statusTone(status: string) {
  return status === "open" ? "warning" : status === "resolved" ? "success" : "neutral";
}

/** A customer's or seller's own disputes (W-12) — the real half of the Support screen's
 *  "Dispute Center" card. Resolving is admin-only (backend/src/common/policy/
 *  ability.factory.ts), so unlike apps/admin's DisputesListScreen there is no status-tabs
 *  admin queue here — just this caller's own disputes, opened or resolved. */
export function DisputeCenterScreen() {
  const query = useMyDisputesQuery();

  if (query.isLoading) {
    return (
      <div className="flex items-center justify-center gap-3 py-24 text-sm text-[color:var(--color-foreground-muted)]">
        <Spinner className="h-4 w-4" /> Loading your disputes...
      </div>
    );
  }

  if (query.isError) {
    return (
      <ErrorState
        action={<Button onClick={() => void query.refetch()}>Try again</Button>}
        description="We couldn't load your disputes."
        title="Something went wrong"
      />
    );
  }

  const disputes = query.data ?? [];

  if (disputes.length === 0) {
    return (
      <EmptyState
        description="Disputes you open about an order or a review will show up here."
        title="No disputes"
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6 lg:px-8">
      <h1 className="mb-6 text-3xl font-bold tracking-tight text-[color:var(--color-foreground)]">
        Dispute Center
      </h1>

      <div className="space-y-3">
        {disputes.map((dispute) => (
          <Link href={`/support/disputes/${dispute.id}`} key={dispute.id} className="group block">
            <Card className="flex items-center justify-between rounded-xl p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div>
                <p className="text-sm font-bold text-[color:var(--color-foreground)] group-hover:text-[color:var(--color-primary)]">
                  {dispute.orderId
                    ? `Order ${dispute.orderId.slice(0, 8)}`
                    : `Review ${dispute.reviewId?.slice(0, 8)}`}
                </p>
                <p className="mt-0.5 max-w-md truncate text-xs text-[color:var(--color-foreground-muted)]">
                  {dispute.reason}
                </p>
              </div>
              <Badge tone={statusTone(dispute.status)}>{dispute.status}</Badge>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
