"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button, Input } from "@nova/ui";
import { loginSchema, type LoginInput } from "@nova/validation";

import { useLoginMutation } from "./auth.mutations";

export function LoginForm() {
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const mutation = useLoginMutation(form.setError);
  const busy = mutation.isPending || mutation.isRedirecting;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[color:var(--color-muted)] px-4">
      <div className="w-full max-w-sm rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-8 shadow-sm">
        <h1 className="text-lg font-semibold text-[color:var(--color-foreground)]">Nova Seller</h1>
        <p className="mt-1 text-sm text-[color:var(--color-foreground-muted)]">
          Sign in with your seller account.
        </p>

        <form
          className="mt-6 flex flex-col gap-4"
          onSubmit={(event) => {
            void form.handleSubmit((data) => mutation.mutate(data))(event);
          }}
        >
          <Input
            label="Email"
            type="email"
            autoComplete="username"
            error={form.formState.errors.email?.message}
            {...form.register("email")}
          />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            error={form.formState.errors.password?.message}
            {...form.register("password")}
          />
          <Button type="submit" fullWidth loading={busy}>
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
}
