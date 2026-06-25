import type { Metadata } from "next";
import { LoginForm } from "@/components/forms/LoginForm";

export const metadata: Metadata = { title: "Login" };

export default function LoginPage() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <h1 className="mb-1 text-2xl font-bold text-slate-900 dark:text-slate-100">Welcome back</h1>
      <p className="mb-6 text-sm text-slate-500">Sign in to your Nova account</p>
      <LoginForm />
    </div>
  );
}
