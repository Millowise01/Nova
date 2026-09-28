"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button, Input } from "@nova/ui";

import { useForgotPasswordMutation } from "../auth.mutations";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "../auth.schemas";

import { AuthFormShell } from "./auth-form-shell";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-[color:var(--color-error)]">{message}</p>;
}

export function ForgotPasswordForm() {
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { phone: "" },
  });
  const {
    formState: { errors },
  } = form;

  const mutation = useForgotPasswordMutation();
  const busy = mutation.isPending;

  return (
    <AuthFormShell
      subtitle="Enter your phone number and we'll send you a one-time code to reset your password."
      title="Recover your password"
    >
      <form
        className="space-y-3"
        onSubmit={(event) => {
          void form.handleSubmit((data) => mutation.mutate(data.phone))(event);
        }}
      >
        <div>
          <Input placeholder="+232" {...form.register("phone")} />
          <FieldError message={errors.phone?.message} />
        </div>

        <Button className="w-full" disabled={busy} type="submit">
          {busy ? "Sending..." : "Send reset code"}
        </Button>
      </form>
    </AuthFormShell>
  );
}
