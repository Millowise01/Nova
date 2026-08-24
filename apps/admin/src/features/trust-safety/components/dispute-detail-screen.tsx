"use client";

import { useState } from "react";

import { Badge, Button, Card, CardBody, Spinner, Textarea } from "@nova/design-system";

import { useAddDisputeCommentMutation, useResolveDisputeMutation } from "../trust-safety.mutations";
import { useDisputeDetailQuery } from "../trust-safety.queries";

function statusTone(status: string) {
  return status === "open" ? "warning" : status === "resolved" ? "success" : "neutral";
}

export function DisputeDetailScreen({ id }: { id: string }) {
  const dispute = useDisputeDetailQuery(id);
  const addComment = useAddDisputeCommentMutation(id);
  const resolveDispute = useResolveDisputeMutation(id);

  const [comment, setComment] = useState("");
  const [resolution, setResolution] = useState("");

  if (dispute.isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!dispute.data) {
    return <p className="text-sm text-[color:var(--color-error)]">Dispute not found.</p>;
  }

  const d = dispute.data;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[color:var(--color-foreground)]">
            Dispute {d.id}
          </h1>
          <p className="text-sm text-[color:var(--color-foreground-muted)]">
            {d.orderId ? `Order ${d.orderId}` : `Review ${d.reviewId}`} — opened by {d.openedBy}
          </p>
        </div>
        <Badge tone={statusTone(d.status)}>{d.status}</Badge>
      </div>

      <Card>
        <CardBody className="flex flex-col gap-1">
          <p className="text-sm font-medium text-[color:var(--color-foreground)]">Reason</p>
          <p className="text-sm text-[color:var(--color-foreground-muted)]">{d.reason}</p>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex flex-col gap-4">
          <p className="text-sm font-medium text-[color:var(--color-foreground)]">Timeline</p>
          <ul className="flex flex-col gap-3">
            {d.events.map((event) => (
              <li
                key={event.id}
                className="rounded-md border border-[color:var(--color-border)] p-3 text-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-[color:var(--color-foreground)]">
                    {event.eventType}
                  </span>
                  <span className="text-xs text-[color:var(--color-foreground-subtle)]">
                    {event.actorId}
                  </span>
                </div>
                {event.note && (
                  <p className="mt-1 text-[color:var(--color-foreground-muted)]">{event.note}</p>
                )}
              </li>
            ))}
          </ul>

          {d.status === "open" && (
            <div className="flex flex-col gap-2 border-t border-[color:var(--color-border)] pt-4">
              <Textarea
                label="Add a comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <Button
                size="sm"
                className="self-end"
                disabled={!comment}
                loading={addComment.isPending}
                onClick={() => addComment.mutate(comment, { onSuccess: () => setComment("") })}
              >
                Post comment
              </Button>
            </div>
          )}
        </CardBody>
      </Card>

      {d.status === "open" && (
        <Card>
          <CardBody className="flex flex-col gap-3">
            <p className="text-sm font-medium text-[color:var(--color-foreground)]">
              Resolve this dispute
            </p>
            <Textarea
              label="Resolution"
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
            />
            <Button
              variant="success"
              className="self-end"
              disabled={!resolution}
              loading={resolveDispute.isPending}
              onClick={() =>
                resolveDispute.mutate(resolution, { onSuccess: () => setResolution("") })
              }
            >
              Resolve dispute
            </Button>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
