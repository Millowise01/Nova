"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button, Input } from "@nova/ui";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "../auth.schemas";
import { AuthFormShell } from "./auth-form-shell";

export function ForgotPasswordForm() {
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" }
  });

  return (
    <AuthFormShell subtitle="We'll send you a reset link and OTP code." title="Recover your password">
      <form className="space-y-3" onSubmit={form.handleSubmit(() => undefined)}>
        <Input placeholder="you@example.com" type="email" {...form.register("email")} />
        <Button className="w-full" type="submit">
          Send reset link
        </Button>
      </form>
    </AuthFormShell>
  );
}
