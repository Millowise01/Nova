"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { authApi } from "@/lib/api";
import { resetPasswordSchema, type ResetPasswordSchema } from "@/schemas/auth";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
  });

  async function onSubmit(values: ResetPasswordSchema) {
    try {
      await authApi.resetPassword(token, values.password);
      toast.success("Password updated! Please sign in.");
      router.push("/auth/login");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Reset failed");
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <h1 className="mb-1 text-2xl font-bold">Reset password</h1>
      <p className="mb-6 text-sm text-slate-500">Choose a new password for your account</p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="New password" type="password" placeholder="••••••••" hint="Minimum 8 characters" error={errors.password?.message} {...register("password")} />
        <Input label="Confirm password" type="password" placeholder="••••••••" error={errors.confirmPassword?.message} {...register("confirmPassword")} />
        <Button type="submit" disabled={isSubmitting} className="w-full py-3">{isSubmitting ? "Updating…" : "Update Password"}</Button>
      </form>
    </div>
  );
}
