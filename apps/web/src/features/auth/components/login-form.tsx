"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button, Input } from "@nova/ui";
import { loginSchema, type LoginFormValues } from "../auth.schemas";
import { AuthFormShell } from "./auth-form-shell";

export function LoginForm() {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" }
  });

  return (
    <AuthFormShell footer={<Link href="/auth/forgot-password">Forgot password?</Link>} subtitle="Sign in to continue shopping, checkout, and track orders." title="Welcome back">
      <form className="space-y-3" onSubmit={form.handleSubmit(() => undefined)}>
        <Input placeholder="you@example.com" type="email" {...form.register("email")} />
        <Input placeholder="Password" type="password" {...form.register("password")} />
        <Button className="w-full" type="submit">
          Login
        </Button>
      </form>
      <p className="text-sm text-slate-600">
        Need an account? <Link className="font-semibold text-[color:var(--ds-primary)]" href="/auth/register">Register</Link>
      </p>
    </AuthFormShell>
  );
}
