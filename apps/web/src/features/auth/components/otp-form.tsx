"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";

import { Alert, Button, Input } from "@nova/ui";

import { useVerifyOtpMutation } from "../auth.mutations";
import { otpSchema, type OtpFormValues } from "../auth.schemas";

import { AuthFormShell } from "./auth-form-shell";

interface OtpFormProps {
  title?: string;
  subtitle?: string;
}

/** POST /v1/auth/otp/verify needs a destination (email or phone) alongside the
 *  code, but this form only collects the code — the destination is expected to
 *  arrive via the link the user followed (e.g. /auth/otp?destination=...), the
 *  same way a password-reset link carries its token. No current screen in the
 *  app links here with that param yet (registration doesn't require OTP
 *  verification), so this form is real but not yet reachable end-to-end. */
export function OtpForm({
  title = "Verify OTP",
  subtitle = "Enter the verification code sent to your email or phone.",
}: OtpFormProps) {
  const destination = useSearchParams().get("destination");

  const form = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      code: "",
    },
  });

  const mutation = useVerifyOtpMutation(destination ?? "");
  const busy = mutation.isPending || mutation.isRedirecting;

  if (!destination) {
    return (
      <AuthFormShell title={title} subtitle={subtitle}>
        <Alert tone="warning">
          No destination to verify — open this page from the verification link you were sent.
        </Alert>
      </AuthFormShell>
    );
  }

  return (
    <AuthFormShell title={title} subtitle={subtitle}>
      <form
        className="space-y-3"
        onSubmit={(event) => {
          void form.handleSubmit((data) => mutation.mutate(data.code))(event);
        }}
      >
        <Input placeholder="Enter OTP" {...form.register("code")} />

        <Button className="w-full" disabled={busy} type="submit">
          {busy ? "Verifying..." : "Verify"}
        </Button>
      </form>
    </AuthFormShell>
  );
}
