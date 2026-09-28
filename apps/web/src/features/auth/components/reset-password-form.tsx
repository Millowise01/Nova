"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";

import { Alert, Button, Input } from "@nova/ui";

import { useResetPasswordMutation } from "../auth.mutations";
import { resetPasswordSchema, type ResetPasswordFormValues } from "../auth.schemas";

import { AuthFormShell } from "./auth-form-shell";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-[color:var(--color-error)]">{message}</p>;
}

/** The phone number that requested the reset arrives via `?phone=...`, the same
 *  query-param handoff OtpForm uses for `?destination=...` — set by
 *  useForgotPasswordMutation's redirect on success. */
export function ResetPasswordForm() {
  const phone = useSearchParams().get("phone");

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      phone: phone ?? "",
      code: "",
      password: "",
      confirmPassword: "",
    },
  });
  const {
    formState: { errors },
  } = form;

  const mutation = useResetPasswordMutation(form.setError);
  const busy = mutation.isPending || mutation.isRedirecting;

  if (!phone) {
    return (
      <AuthFormShell
        subtitle="Set a strong password to secure your account."
        title="Reset password"
      >
        <Alert tone="warning">
          No phone number to reset — start from the &quot;Forgot password&quot; page.
        </Alert>
      </AuthFormShell>
    );
  }

  return (
    <AuthFormShell subtitle="Set a strong password to secure your account." title="Reset password">
      <form
        className="space-y-3"
        onSubmit={(event) => {
          void form.handleSubmit((data) => mutation.mutate(data))(event);
        }}
      >
        <div>
          <Input placeholder="6-digit code" {...form.register("code")} />
          <FieldError message={errors.code?.message} />
        </div>

        <div>
          <Input placeholder="New password" type="password" {...form.register("password")} />
          <FieldError message={errors.password?.message} />
        </div>

        <div>
          <Input
            placeholder="Confirm password"
            type="password"
            {...form.register("confirmPassword")}
          />
          <FieldError message={errors.confirmPassword?.message} />
        </div>

        <Button className="w-full" disabled={busy} type="submit">
          {busy ? "Updating..." : "Update password"}
        </Button>
      </form>
    </AuthFormShell>
  );
}
