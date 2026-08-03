"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button, Input } from "@nova/ui";

import { otpSchema, type OtpFormValues } from "../auth.schemas";

import { AuthFormShell } from "./auth-form-shell";

interface OtpFormProps {
  title?: string;
  subtitle?: string;
}

export function OtpForm({
  title = "Verify OTP",
  subtitle = "Enter the verification code sent to your email or phone.",
}: OtpFormProps) {
  const form = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      code: "",
    },
  });

  const onSubmit = (data: OtpFormValues) => {
    // TODO: Verify OTP
    console.log(data);
  };

  return (
    <AuthFormShell title={title} subtitle={subtitle}>
      <form
        className="space-y-3"
        onSubmit={(event) => {
          void form.handleSubmit(onSubmit)(event);
        }}
      >
        <Input placeholder="Enter OTP" {...form.register("code")} />

        <Button className="w-full" type="submit">
          Verify
        </Button>
      </form>
    </AuthFormShell>
  );
}
