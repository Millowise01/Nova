"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";

import { Button, Input } from "@nova/ui";

import { useLoginMutation } from "../auth.mutations";
import { loginSchema, type LoginFormValues } from "../auth.schemas";

import { AuthFormShell } from "./auth-form-shell";

export function LoginForm() {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const mutation = useLoginMutation(form.setError);
  const busy = mutation.isPending || mutation.isRedirecting;

  return (
    <AuthFormShell
      footer={<Link href="/auth/forgot-password">Forgot password?</Link>}
      subtitle="Sign in to continue shopping, checkout, and track orders."
      title="Welcome back"
    >
      <form
        className="space-y-3"
        onSubmit={(event) => {
          void form.handleSubmit((data) => mutation.mutate(data))(event);
        }}
      >
        <Input placeholder="you@example.com" type="email" {...form.register("email")} />
        {form.formState.errors.email && (
          <p className="text-sm text-[color:var(--color-error)]">
            {form.formState.errors.email.message}
          </p>
        )}

        <Input placeholder="Password" type="password" {...form.register("password")} />
        {form.formState.errors.password && (
          <p className="text-sm text-[color:var(--color-error)]">
            {form.formState.errors.password.message}
          </p>
        )}

        <Button className="w-full" disabled={busy} type="submit">
          {busy ? "Signing in..." : "Login"}
        </Button>
      </form>

      <p className="text-sm text-slate-600">
        Need an account?{" "}
        <Link className="font-semibold text-[color:var(--ds-primary)]" href="/auth/register">
          Register
        </Link>
      </p>
    </AuthFormShell>
  );
}
