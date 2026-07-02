"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button, Input } from "@nova/ui";
import { resetPasswordSchema, type ResetPasswordFormValues } from "../auth.schemas";
import { AuthFormShell } from "./auth-form-shell";

export function ResetPasswordForm() {
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" }
  });

  return (
    <AuthFormShell subtitle="Set a strong password to secure your account." title="Reset password">
      <form className="space-y-3" onSubmit={form.handleSubmit(() => undefined)}>
        <Input placeholder="New password" type="password" {...form.register("password")} />
        <Input placeholder="Confirm password" type="password" {...form.register("confirmPassword")} />
        <Button className="w-full" type="submit">
          Update password
        </Button>
      </form>
    </AuthFormShell>
  );
}
