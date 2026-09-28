"use client";

import { useState } from "react";

import { Badge, Button, Card, CardBody, Spinner, Textarea } from "@nova/ui";

import { useAddDisputeCommentMutation } from "../trust-safety.mutations";
import { useDisputeDetailQuery } from "../trust-safety.queries";

function statusTone(status: string) {
  return status === "open" ? "warning" : status === "resolved" ? "success" : "neutral";
}

/** A caller's own dispute, with its timeline and the ability to comment while it's open
 *  (W-12) — mirrors apps/admin's DisputeDetailScreen, minus the "Resolve" action: that
 *  ability is admin-only (backend/src/common/policy/ability.factory.ts grants the opener
 *  create/read/update only, never "manage"), so there is nothing for this screen to offer
 *  there. */
export function DisputeDetailScreen({ id }: { id: string }) {
  const dispute = useDisputeDetailQuery(id);
  const addComment = useAddDisputeCommentMutation(id);
  const [comment, setComment] = useState("");

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
    <div className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6 lg:px-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[color:var(--color-foreground)]">
            {d.orderId ? `Order ${d.orderId}` : `Review ${d.reviewId}`}
          </h1>
          <p className="text-sm text-[color:var(--color-foreground-muted)]">{d.reason}</p>
        </div>
        <Badge tone={statusTone(d.status)}>{d.status}</Badge>
      </div>

      <Card className="mt-6">
        <CardBody className="flex flex-col gap-4">
          <p className="text-sm font-medium text-[color:var(--color-foreground)]">Timeline</p>
          <ul className="flex flex-col gap-3">
            {d.events.map((event) => (
              <li
                key={event.id}
                className="rounded-md border border-[color:var(--color-border)] p-3 text-sm"
              >
                <span className="font-medium text-[color:var(--color-foreground)]">
                  {event.eventType}
                </span>
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
    </div>
  );
}
