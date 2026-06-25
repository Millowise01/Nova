"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { authApi } from "@/lib/api";
import { otpSchema, type OtpSchema } from "@/schemas/auth";

export default function OtpVerificationPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<OtpSchema>({
    resolver: zodResolver(otpSchema),
  });

  async function onSubmit(values: OtpSchema) {
    try {
      await authApi.verifyOtp("", values.otp);
      toast.success("Phone verified successfully!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid OTP");
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <h1 className="mb-1 text-2xl font-bold">OTP Verification</h1>
      <p className="mb-6 text-sm text-slate-500">Enter the 6-digit code sent to your phone</p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="One-time password" maxLength={6} placeholder="123456" error={errors.otp?.message} {...register("otp")} />
        <Button type="submit" disabled={isSubmitting} className="w-full py-3">{isSubmitting ? "Verifying…" : "Verify"}</Button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-500">
        Didn&apos;t receive a code?{" "}
        <button className="font-medium text-primary hover:underline" onClick={() => toast("Resent OTP")}>Resend</button>
      </p>
    </div>
  );
}
