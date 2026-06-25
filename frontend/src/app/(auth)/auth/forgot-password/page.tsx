"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { authApi } from "@/lib/api";
import { forgotPasswordSchema, type ForgotPasswordSchema } from "@/schemas/auth";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(values: ForgotPasswordSchema) {
    try {
      await authApi.forgotPassword(values.email);
      setSent(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Request failed");
    }
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <CheckCircle2 size={40} className="mx-auto mb-4 text-success" />
        <h2 className="text-xl font-bold">Check your email</h2>
        <p className="mt-2 text-sm text-slate-500">Reset instructions have been sent if that email is registered.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <h1 className="mb-1 text-2xl font-bold">Forgot password</h1>
      <p className="mb-6 text-sm text-slate-500">Enter your email and we&apos;ll send reset instructions</p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Email address" type="email" placeholder="you@example.com" error={errors.email?.message} {...register("email")} />
        <Button type="submit" disabled={isSubmitting} className="w-full py-3">{isSubmitting ? "Sending…" : "Send Reset Link"}</Button>
      </form>
    </div>
  );
}
