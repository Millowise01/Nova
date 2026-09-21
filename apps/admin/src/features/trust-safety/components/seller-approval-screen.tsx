"use client";

import { useState } from "react";

import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  DataTable,
  type DataTableColumn,
} from "@nova/ui";
import type { KycSubmissionResponse, SellerSuspensionRequestResponse } from "@nova/validation";

import { useAuth } from "@/providers/auth-provider";

import {
  useConfirmKycDecisionMutation,
  useConfirmSuspensionRequestMutation,
  useProposeKycDecisionMutation,
  useProposeReinstateMutation,
  useProposeSuspendMutation,
  useRejectSuspensionRequestMutation,
} from "../trust-safety.mutations";
import { useKycQueueQuery, useSuspensionQueueQuery } from "../trust-safety.queries";

function statusBadge(status: string) {
  const tone =
    status === "approved" || status === "executed"
      ? "success"
      : status === "rejected"
        ? "error"
        : "warning";
  return (
    <Badge tone={tone} size="sm">
      {status}
    </Badge>
  );
}

function KycTab() {
  const { session } = useAuth();
  const queue = useKycQueueQuery();
  const propose = useProposeKycDecisionMutation();
  const confirm = useConfirmKycDecisionMutation();
  const [proposeTarget, setProposeTarget] = useState<KycSubmissionResponse | null>(null);
  const [proposeDecision, setProposeDecision] = useState<"approve" | "reject">("approve");
  const [proposeReason, setProposeReason] = useState("");

  const columns: DataTableColumn<KycSubmissionResponse>[] = [
    { key: "subjectId", header: "Seller / rider ID" },
    { key: "subjectType", header: "Type" },
    { key: "documentReference", header: "Document reference" },
    {
      key: "status",
      header: "Status",
      render: (row) => statusBadge(row.status),
    },
    {
      key: "proposedDecision",
      header: "Proposed decision",
      render: (row) =>
        row.proposedDecision ? (
          <span className="text-sm">
            {row.proposedDecision}
            {row.reviewProposedBy === session?.userId && (
              <span className="ml-1 text-xs text-[color:var(--color-foreground-subtle)]">
                (by you — needs another admin)
              </span>
            )}
          </span>
        ) : (
          <span className="text-[color:var(--color-foreground-subtle)]">—</span>
        ),
    },
    {
      key: "id",
      header: "",
      align: "right",
      render: (row) =>
        row.proposedDecision ? (
          <Button
            size="sm"
            variant="outline"
            disabled={row.reviewProposedBy === session?.userId}
            loading={confirm.isPending && confirm.variables === row.id}
            onClick={() => confirm.mutate(row.id)}
          >
            Confirm decision
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setProposeTarget(row);
              setProposeDecision("approve");
              setProposeReason("");
            }}
          >
            Propose decision
          </Button>
        ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={queue.data ?? []}
        keyField="id"
        loading={queue.isLoading}
        emptyTitle="No pending KYC submissions"
      />

      <Dialog open={!!proposeTarget} onClose={() => setProposeTarget(null)} size="sm">
        <DialogHeader>
          <DialogTitle>Propose a KYC decision</DialogTitle>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={proposeDecision === "approve" ? "primary" : "outline"}
              onClick={() => setProposeDecision("approve")}
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant={proposeDecision === "reject" ? "danger" : "outline"}
              onClick={() => setProposeDecision("reject")}
            >
              Reject
            </Button>
          </div>
          <Textarea
            label="Reason (optional)"
            value={proposeReason}
            onChange={(e) => setProposeReason(e.target.value)}
          />
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => setProposeTarget(null)}>
            Cancel
          </Button>
          <Button
            loading={propose.isPending}
            onClick={() => {
              if (!proposeTarget) return;
              propose.mutate(
                {
                  id: proposeTarget.id,
                  input: { decision: proposeDecision, reason: proposeReason || undefined },
                },
                { onSuccess: () => setProposeTarget(null) },
              );
            }}
          >
            Submit proposal
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}

function SuspensionTab() {
  const { session } = useAuth();
  const queue = useSuspensionQueueQuery();
  const confirm = useConfirmSuspensionRequestMutation();
  const reject = useRejectSuspensionRequestMutation();
  const proposeSuspend = useProposeSuspendMutation();
  const proposeReinstate = useProposeReinstateMutation();

  const [sellerId, setSellerId] = useState("");
  const [reason, setReason] = useState("");
  const [rejectTarget, setRejectTarget] = useState<SellerSuspensionRequestResponse | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const columns: DataTableColumn<SellerSuspensionRequestResponse>[] = [
    { key: "sellerId", header: "Seller ID" },
    {
      key: "action",
      header: "Action",
      render: (row) => (
        <Badge tone={row.action === "suspend" ? "error" : "success"} size="sm">
          {row.action}
        </Badge>
      ),
    },
    { key: "reason", header: "Reason" },
    { key: "status", header: "Status", render: (row) => statusBadge(row.status) },
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
            loading={confirm.isPending && confirm.variables === row.id}
            onClick={() => confirm.mutate(row.id)}
          >
            Confirm
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
      <Card>
        <CardHeader>
          <CardTitle>Propose a suspension or reinstatement</CardTitle>
        </CardHeader>
        <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <Input
            label="Seller ID"
            value={sellerId}
            onChange={(e) => setSellerId(e.target.value)}
            className="sm:max-w-xs"
          />
          <Input label="Reason" value={reason} onChange={(e) => setReason(e.target.value)} />
          <div className="flex gap-2">
            <Button
              variant="danger"
              disabled={!sellerId || !reason}
              loading={proposeSuspend.isPending}
              onClick={() =>
                proposeSuspend.mutate(
                  { sellerId, reason },
                  {
                    onSuccess: () => {
                      setSellerId("");
                      setReason("");
                    },
                  },
                )
              }
            >
              Propose suspend
            </Button>
            <Button
              variant="outline"
              disabled={!sellerId || !reason}
              loading={proposeReinstate.isPending}
              onClick={() =>
                proposeReinstate.mutate(
                  { sellerId, reason },
                  {
                    onSuccess: () => {
                      setSellerId("");
                      setReason("");
                    },
                  },
                )
              }
            >
              Propose reinstate
            </Button>
          </div>
        </CardBody>
      </Card>

      <DataTable
        columns={columns}
        data={queue.data ?? []}
        keyField="id"
        loading={queue.isLoading}
        emptyTitle="No pending suspension requests"
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
          <DialogTitle>Reject this request?</DialogTitle>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-4">
          <p className="text-sm text-[color:var(--color-foreground-muted)]">
            {rejectTarget ? `${rejectTarget.action} for seller ${rejectTarget.sellerId}` : ""}
          </p>
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
            loading={reject.isPending}
            onClick={() => {
              if (!rejectTarget) return;
              reject.mutate(
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

export function SellerApprovalScreen() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-[color:var(--color-foreground)]">
          Seller Approval & Suspension
        </h1>
        <p className="text-sm text-[color:var(--color-foreground-muted)]">
          Every decision needs a second, different admin to confirm it.
        </p>
      </div>

      <Tabs defaultValue="kyc">
        <TabsList>
          <TabsTrigger value="kyc">KYC review</TabsTrigger>
          <TabsTrigger value="suspension">Seller suspension</TabsTrigger>
        </TabsList>
        <TabsContent value="kyc">
          <KycTab />
        </TabsContent>
        <TabsContent value="suspension">
          <SuspensionTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
