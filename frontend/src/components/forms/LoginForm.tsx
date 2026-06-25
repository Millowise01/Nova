"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { loginSchema, type LoginSchema } from "@/schemas/auth";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const setSession = useAuthStore((s) => s.setSession);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(values: LoginSchema) {
    try {
      const { data } = await authApi.login(values);
      setSession(data.data.accessToken, data.data.user);
      toast.success(`Welcome back, ${data.data.user.firstName}!`);
      const redirect = params.get("redirect");
      if (redirect) { router.push(redirect); return; }
      const role = data.data.user.role;
      router.push(role === "admin" ? "/admin" : role === "seller" ? "/seller/dashboard" : "/account");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed. Check your credentials.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Input label="Email address" type="email" autoComplete="email" placeholder="you@example.com" error={errors.email?.message} {...register("email")} />
      <Input label="Password" type="password" autoComplete="current-password" placeholder="••••••••" error={errors.password?.message} {...register("password")} />
      <div className="flex justify-end">
        <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">Forgot password?</Link>
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full py-3">{isSubmitting ? "Signing in…" : "Sign In"}</Button>
      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-800" /></div>
        <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-slate-400 dark:bg-slate-950">or continue with</span></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {["Google", "Apple"].map((p) => (
          <button key={p} type="button" className="rounded-xl border border-slate-300 py-2.5 text-sm font-medium transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-900">{p}</button>
        ))}
      </div>
      <p className="text-center text-sm text-slate-500">
        No account?{" "}<Link href="/auth/signup" className="font-medium text-primary hover:underline">Sign up free</Link>
      </p>
    </form>
  );
}
