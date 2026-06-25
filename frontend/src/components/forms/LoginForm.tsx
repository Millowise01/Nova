"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { type LoginSchema, loginSchema } from "@/schemas/auth";

export function LoginForm() {
  const { register, handleSubmit, formState } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (values: LoginSchema) => {
    console.log(values);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label className="mb-1 block text-sm font-medium">Email</label>
        <input className="w-full rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-900" {...register("email")} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Password</label>
        <input
          type="password"
          className="w-full rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-900"
          {...register("password")}
        />
      </div>
      {formState.errors.email && <p className="text-sm text-error">{formState.errors.email.message}</p>}
      <Button type="submit" className="w-full">Sign In</Button>
    </form>
  );
}
