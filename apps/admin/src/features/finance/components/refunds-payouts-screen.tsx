"use client";

import { useState } from "react";

import {
  Badge,
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Textarea,
  DataTable,
  type DataTableColumn,
} from "@nova/ui";

import { useAuth } from "@/providers/auth-provider";

import {
  useApprovePayoutMutation,
  useApproveRefundMutation,
  useRejectPayoutMutation,
  useRejectRefundMutation,
} from "../finance.mutations";
import { usePayoutsQueueQuery, useRefundsQueueQuery } from "../finance.queries";

type QueueRow = {
  id: string;
  type: "refund" | "payout";
  target: string;
  amount: string;
  currency: string;
  reason: string;
  status: string;
  proposedBy: string;
};

export function RefundsPayoutsScreen() {
  const { session } = useAuth();
  const refunds = useRefundsQueueQuery();
  const payouts = usePayoutsQueueQuery();
  const approveRefund = useApproveRefundMutation();
  const rejectRefund = useRejectRefundMutation();
  const approvePayout = useApprovePayoutMutation();
  const rejectPayout = useRejectPayoutMutation();

  const [rejectTarget, setRejectTarget] = useState<QueueRow | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const loading = refunds.isLoading || payouts.isLoading;

  const rows: QueueRow[] = [
    ...(refunds.data ?? []).map((r): QueueRow => ({
      id: r.id,
      type: "refund",
      target: r.paymentIntentId,
      amount: r.amount,
      currency: r.currency,
      reason: r.reason,
      status: r.status,
      proposedBy: r.proposedBy,
    })),
    ...(payouts.data ?? []).map((p): QueueRow => ({
      id: p.id,
      type: "payout",
      target: p.sellerId,
      amount: p.amount,
      currency: p.currency,
      reason: p.reason,
      status: p.status,
      proposedBy: p.proposedBy,
    })),
  ];

  const isApproving = (row: QueueRow) =>
    row.type === "refund"
      ? approveRefund.isPending && approveRefund.variables === row.id
      : approvePayout.isPending && approvePayout.variables === row.id;

  const columns: DataTableColumn<QueueRow>[] = [
    {
      key: "type",
      header: "Type",
      render: (row) => (
        <Badge tone={row.type === "refund" ? "info" : "accent"} size="sm">
          {row.type}
        </Badge>
      ),
    },
    { key: "target", header: "Payment intent / seller" },
    {
      key: "amount",
      header: "Amount",
      render: (row) => `${row.currency} ${row.amount}`,
    },
    { key: "reason", header: "Reason" },
    {
      key: "id",
      header: "",
      align: "right",
      render: (row) => (
        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={row.proposedBy === session?.userId}
            loading={isApproving(row)}
            onClick={() =>
              row.type === "refund" ? approveRefund.mutate(row.id) : approvePayout.mutate(row.id)
            }
          >
            Approve
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setRejectTarget(row)}>
            Reject
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-[color:var(--color-foreground)]">
          Refunds & Payouts
        </h1>
        <p className="text-sm text-[color:var(--color-foreground-muted)]">
          Above-threshold proposals need a second, different admin — self-approval is blocked
          server-side.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        keyField="id"
        loading={loading}
        emptyTitle="Nothing awaiting review"
      />

      <Dialog
        open={!!rejectTarget}
        onClose={() => {
          setRejectTarget(null);
          setRejectReason("");
        }}
        size="sm"
      >
        <DialogHeader>
          <DialogTitle>Reject this {rejectTarget?.type}?</DialogTitle>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-4">
          <Textarea
            label="Reason"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </DialogBody>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setRejectTarget(null);
              setRejectReason("");
            }}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            disabled={!rejectReason}
            loading={rejectRefund.isPending || rejectPayout.isPending}
            onClick={() => {
              if (!rejectTarget) return;
              const mutation = rejectTarget.type === "refund" ? rejectRefund : rejectPayout;
              mutation.mutate(
                { id: rejectTarget.id, reason: rejectReason },
                {
                  onSuccess: () => {
                    setRejectTarget(null);
                    setRejectReason("");
                  },
                },
              );
            }}
          >
            Reject
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
