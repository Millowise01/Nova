"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Shield, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { changePasswordSchema, type ChangePasswordSchema } from "@/schemas/auth";

export default function SecurityPage() {
  const [twoFaEnabled, setTwoFaEnabled] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordSchema>({ resolver: zodResolver(changePasswordSchema) });

  async function onSubmit(_values: ChangePasswordSchema) {
    await new Promise((r) => setTimeout(r, 600));
    toast.success("Password updated successfully");
    reset();
  }

  return (
    <div className="space-y-6 py-6">
      <h1 className="text-2xl font-bold">Security Settings</h1>

      {/* Change password */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
      >
        <h2 className="mb-5 flex items-center gap-2 font-semibold">
          <Shield size={16} className="text-primary" />
          Change Password
        </h2>
        <div className="space-y-4">
          <Input
            label="Current password"
            type="password"
            placeholder="••••••••"
            error={errors.currentPassword?.message}
            {...register("currentPassword")}
          />
          <Input
            label="New password"
            type="password"
            placeholder="••••••••"
            hint="Minimum 8 characters"
            error={errors.newPassword?.message}
            {...register("newPassword")}
          />
          <Input
            label="Confirm new password"
            type="password"
            placeholder="••••••••"
            error={errors.confirmNewPassword?.message}
            {...register("confirmNewPassword")}
          />
        </div>
        <Button type="submit" disabled={isSubmitting} className="mt-5">
          {isSubmitting ? "Updating…" : "Update Password"}
        </Button>
      </form>

      {/* 2FA */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <ShieldCheck size={18} className="mt-0.5 flex-shrink-0 text-primary" />
            <div>
              <h2 className="font-semibold">Two-Factor Authentication</h2>
              <p className="mt-0.5 text-sm text-slate-500">
                Add an extra layer of security to your account.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setTwoFaEnabled((v) => !v);
              toast.success(twoFaEnabled ? "2FA disabled" : "2FA enabled");
            }}
            role="switch"
            aria-checked={twoFaEnabled}
            className="relative"
          >
            <div
              className={`h-6 w-11 rounded-full transition ${twoFaEnabled ? "bg-primary" : "bg-slate-300 dark:bg-slate-700"}`}
            >
              <div
                className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${twoFaEnabled ? "translate-x-6" : "translate-x-1"}`}
              />
            </div>
          </button>
        </div>
        {twoFaEnabled && (
          <div className="mt-4 rounded-xl bg-primary/5 p-4 text-sm text-slate-700 dark:text-slate-300">
            2FA is active. Scan the QR code in your authenticator app to add this account.
          </div>
        )}
      </div>

      {/* Active sessions */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 font-semibold">Active Sessions</h2>
        <div className="space-y-3">
          {[
            { device: "Chrome on Windows", location: "Freetown, SL", current: true },
            { device: "Nova App on Android", location: "Freetown, SL", current: false },
          ].map((session) => (
            <div
              key={session.device}
              className="flex items-center justify-between rounded-xl border border-slate-100 p-3 dark:border-slate-800"
            >
              <div>
                <p className="text-sm font-medium">{session.device}</p>
                <p className="text-xs text-slate-500">{session.location}</p>
              </div>
              {session.current ? (
                <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                  Current
                </span>
              ) : (
                <button
                  className="text-xs font-medium text-error hover:underline"
                  onClick={() => toast.success("Session revoked")}
                >
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
