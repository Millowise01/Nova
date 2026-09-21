"use client";

import { useState } from "react";

import { Alert, Button, Card, Input } from "@nova/ui";

import { useAuth } from "@/providers/auth-provider";

import { useSubmitKycMutation } from "../kyc.mutations";

/** Honest about a real limitation, not a binary show/hide: there is currently
 *  no way for a seller to check their own KYC status (GET /v1/trust-safety/kyc
 *  is admin-only — see @nova/api-client's submitKyc doc comment). This screen
 *  can confirm "your submission was received" for the current session (from
 *  the POST response), but cannot show pending/approved/rejected on a fresh
 *  page load — that's a real backend gap, logged in backend/docs/10, not
 *  faked here with client-only state that would silently lie after a reload. */
export function KycOnboardingScreen() {
  const { session } = useAuth();
  const [documentReference, setDocumentReference] = useState("");
  const [justSubmitted, setJustSubmitted] = useState(false);
  const submit = useSubmitKycMutation();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-[color:var(--color-foreground)]">
          Seller Verification (KYC)
        </h1>
        <p className="text-sm text-[color:var(--color-foreground-muted)]">
          Submit your verification document to start selling on Nova.
        </p>
      </div>

      <Alert tone="warning">
        This portal can&apos;t currently show your verification status after you leave this page —
        checking a submitted status isn&apos;t available yet. You&apos;ll be notified once a
        decision is made.
      </Alert>

      {justSubmitted && (
        <Alert tone="success">
          Submission received — it&apos;s pending review. You can submit again below if you need to
          correct something.
        </Alert>
      )}

      <Card className="flex max-w-lg flex-col gap-4">
        <Input
          label="Document reference"
          helperText="A reference ID for your business registration or ID document."
          value={documentReference}
          onChange={(e) => setDocumentReference(e.target.value)}
        />
        <Button
          disabled={!documentReference || !session}
          loading={submit.isPending}
          onClick={() => {
            if (!session) return;
            submit.mutate(
              { subjectId: session.userId, subjectType: "seller", documentReference },
              {
                onSuccess: () => {
                  setJustSubmitted(true);
                  setDocumentReference("");
                },
              },
            );
          }}
        >
          Submit for review
        </Button>
      </Card>
    </div>
  );
}
