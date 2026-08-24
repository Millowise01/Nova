"use client";

import Link from "next/link";

import { StatCard } from "@nova/ui";

import { usePayoutsQueueQuery, useRefundsQueueQuery } from "@/features/finance/finance.queries";
import {
  useDisputesQueueQuery,
  useKycQueueQuery,
} from "@/features/trust-safety/trust-safety.queries";

export default function DashboardHomePage() {
  const kycQuery = useKycQueueQuery();
  const refundsQuery = useRefundsQueueQuery();
  const payoutsQuery = usePayoutsQueueQuery();
  const disputesQuery = useDisputesQueueQuery("open");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-[color:var(--color-foreground)]">Overview</h1>
        <p className="text-sm text-[color:var(--color-foreground-muted)]">
          What's waiting for review right now.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link href="/sellers">
          <StatCard
            title="Pending KYC submissions"
            value={kycQuery.data?.length ?? 0}
            loading={kycQuery.isLoading}
          />
        </Link>
        <Link href="/finance">
          <StatCard
            title="Refunds + payouts awaiting review"
            value={(refundsQuery.data?.length ?? 0) + (payoutsQuery.data?.length ?? 0)}
            loading={refundsQuery.isLoading || payoutsQuery.isLoading}
          />
        </Link>
        <Link href="/disputes">
          <StatCard
            title="Open disputes"
            value={disputesQuery.data?.length ?? 0}
            loading={disputesQuery.isLoading}
          />
        </Link>
      </div>
    </div>
  );
}
