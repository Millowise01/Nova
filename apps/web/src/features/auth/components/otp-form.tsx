"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button, Input } from "@nova/ui";
import { otpSchema, type OtpFormValues } from "../auth.schemas";
import { AuthFormShell } from "./auth-form-shell";

export function OtpForm({ title }: { title: string }) {
  const form = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: "" }
  });

  return (
    <AuthFormShell subtitle="Enter the 6-digit verification code." title={title}>
      <form className="space-y-3" onSubmit={form.handleSubmit(() => undefined)}>
        <Input inputMode="numeric" maxLength={6} placeholder="000000" {...form.register("code")} />
        <Button className="w-full" type="submit">
          Verify
        </Button>
      </form>
    </AuthFormShell>
  );
}
