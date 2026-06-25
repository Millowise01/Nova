"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Link from "next/link";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { signupSchema, type SignupSchema } from "@/schemas/auth";

export function SignupForm() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<SignupSchema>({
    resolver: zodResolver(signupSchema),
    defaultValues: { role: "customer" },
  });

  const role = watch("role");

  async function onSubmit(values: SignupSchema) {
    try {
      const { data } = await authApi.signup(values);
      const session = data.data;
      setSession(session.accessToken, session.user);
      toast.success("Account created! Welcome to Nova.");
      router.push(values.role === "seller" ? "/seller/dashboard" : "/account");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="First name" autoComplete="given-name" placeholder="Aminata" error={errors.firstName?.message} {...register("firstName")} />
        <Input label="Last name" autoComplete="family-name" placeholder="Koroma" error={errors.lastName?.message} {...register("lastName")} />
      </div>
      <Input label="Email address" type="email" autoComplete="email" placeholder="you@example.com" error={errors.email?.message} {...register("email")} />
      <Input label="Phone number" type="tel" autoComplete="tel" placeholder="+232 76 000 000" error={errors.phone?.message} {...register("phone")} />
      <Input label="Password" type="password" autoComplete="new-password" placeholder="••••••••" hint="Minimum 8 characters" error={errors.password?.message} {...register("password")} />

      <div>
        <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">I want to</p>
        <div className="grid grid-cols-2 gap-3">
          {(["customer", "seller"] as const).map((r) => (
            <label
              key={r}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${role === r ? "border-primary bg-primary/5" : "border-slate-200 hover:border-slate-300 dark:border-slate-700"}`}
            >
              <input type="radio" value={r} {...register("role")} className="accent-primary" />
              <div>
                <p className="text-sm font-medium">{r === "customer" ? "Shop" : "Sell"}</p>
                <p className="text-xs text-slate-500">{r === "customer" ? "Buy products" : "List products"}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full py-3">
        {isSubmitting ? "Creating account…" : "Create Account"}
      </Button>

      <p className="text-center text-sm text-slate-600 dark:text-slate-400">
        Already have an account?{" "}
        <Link href="/auth/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
