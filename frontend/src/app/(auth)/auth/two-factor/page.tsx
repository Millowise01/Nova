"use client";

import { useState } from "react";
import { Shield } from "lucide-react";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function TwoFactorPage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleVerify() {
    if (code.length < 6) { toast.error("Enter your 6-digit code"); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    toast.success("2FA verified");
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex justify-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <Shield size={28} className="text-primary" />
        </div>
      </div>
      <h1 className="mb-1 text-center text-2xl font-bold">Two-Factor Auth</h1>
      <p className="mb-6 text-center text-sm text-slate-500">Enter the code from your authenticator app</p>
      <div className="space-y-4">
        <Input label="Authentication code" maxLength={6} placeholder="000000" value={code} onChange={(e) => setCode(e.target.value)} />
        <Button onClick={handleVerify} disabled={loading} className="w-full py-3">{loading ? "Verifying…" : "Verify"}</Button>
        <p className="text-center text-sm text-slate-500">Lost access?{" "}<button className="text-primary hover:underline">Use recovery code</button></p>
      </div>
    </div>
  );
}
