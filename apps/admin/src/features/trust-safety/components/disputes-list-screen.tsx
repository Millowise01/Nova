"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Badge, Tabs, TabsList, TabsTrigger } from "@nova/design-system";
import { DataTable, type DataTableColumn } from "@nova/ui";
import type { DisputeResponse } from "@nova/validation";

import { useDisputesQueueQuery } from "../trust-safety.queries";

function statusTone(status: string) {
  return status === "open" ? "warning" : status === "resolved" ? "success" : "neutral";
}

export function DisputesListScreen() {
  const router = useRouter();
  const [status, setStatus] = useState<"open" | "resolved" | "closed">("open");
  const disputes = useDisputesQueueQuery(status);

  const columns: DataTableColumn<DisputeResponse>[] = [
    { key: "id", header: "Dispute ID" },
    {
      key: "orderId",
      header: "References",
      render: (row) => (row.orderId ? `Order ${row.orderId}` : `Review ${row.reviewId}`),
    },
    { key: "reason", header: "Reason" },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <Badge tone={statusTone(row.status)} size="sm">
          {row.status}
        </Badge>
      ),
    },
    { key: "openedBy", header: "Opened by" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-[color:var(--color-foreground)]">
          Dispute Resolution
        </h1>
        <p className="text-sm text-[color:var(--color-foreground-muted)]">
          Not dual-authorized — any admin can resolve a dispute directly.
        </p>
      </div>

      <Tabs defaultValue="open" onValueChange={(v) => setStatus(v as typeof status)}>
        <TabsList>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
          <TabsTrigger value="closed">Closed</TabsTrigger>
        </TabsList>
      </Tabs>

      <DataTable
        columns={columns}
        data={disputes.data ?? []}
        keyField="id"
        loading={disputes.isLoading}
        emptyTitle={`No ${status} disputes`}
        onRowClick={(row) => router.push(`/disputes/${row.id}`)}
      />
    </div>
  );
}
