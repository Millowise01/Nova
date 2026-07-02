"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button, Input } from "@nova/ui";
import { registerSchema, type RegisterFormValues } from "../auth.schemas";
import { AuthFormShell } from "./auth-form-shell";

export function RegisterForm() {
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: ""
    }
  });

  return (
    <AuthFormShell subtitle="Create your Nova customer account to access wallet, rewards, and order tracking." title="Create your account">
      <form className="space-y-3" onSubmit={form.handleSubmit(() => undefined)}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input placeholder="First name" {...form.register("firstName")} />
          <Input placeholder="Last name" {...form.register("lastName")} />
        </div>
        <Input placeholder="you@example.com" type="email" {...form.register("email")} />
        <Input placeholder="+232" {...form.register("phone")} />
        <Input placeholder="Password" type="password" {...form.register("password")} />
        <Input placeholder="Confirm password" type="password" {...form.register("confirmPassword")} />
        <Button className="w-full" type="submit">
          Register
        </Button>
      </form>
      <p className="text-sm text-slate-600">
        Already have an account? <Link className="font-semibold text-[color:var(--ds-primary)]" href="/auth/login">Login</Link>
      </p>
    </AuthFormShell>
  );
}
