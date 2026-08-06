"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";

import { Button, Input } from "@nova/ui";

import { useSignupMutation } from "../auth.mutations";
import { registerSchema, type RegisterFormValues } from "../auth.schemas";

import { AuthFormShell } from "./auth-form-shell";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-[color:var(--color-error)]">{message}</p>;
}

export function RegisterForm() {
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const mutation = useSignupMutation(form.setError);
  const busy = mutation.isPending || mutation.isRedirecting;
  const errors = form.formState.errors;

  return (
    <AuthFormShell
      subtitle="Create your Nova customer account to access wallet, rewards, and order tracking."
      title="Create your account"
    >
      <form
        className="space-y-3"
        onSubmit={(event) => {
          void form.handleSubmit((data) => mutation.mutate(data))(event);
        }}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Input placeholder="First name" {...form.register("firstName")} />
            <FieldError message={errors.firstName?.message} />
          </div>

          <div>
            <Input placeholder="Last name" {...form.register("lastName")} />
            <FieldError message={errors.lastName?.message} />
          </div>
        </div>

        <div>
          <Input placeholder="you@example.com" type="email" {...form.register("email")} />
          <FieldError message={errors.email?.message} />
        </div>

        <div>
          <Input placeholder="+232" {...form.register("phone")} />
          <FieldError message={errors.phone?.message} />
        </div>

        <div>
          <Input placeholder="Password" type="password" {...form.register("password")} />
          <FieldError message={errors.password?.message} />
        </div>

        <div>
          <Input
            placeholder="Confirm password"
            type="password"
            {...form.register("confirmPassword")}
          />
          <FieldError message={errors.confirmPassword?.message} />
        </div>

        <Button className="w-full" disabled={busy} type="submit">
          {busy ? "Creating account..." : "Register"}
        </Button>
      </form>

      <p className="text-sm text-slate-600">
        Already have an account?{" "}
        <Link className="font-semibold text-[color:var(--ds-primary)]" href="/auth/login">
          Login
        </Link>
      </p>
    </AuthFormShell>
  );
}
