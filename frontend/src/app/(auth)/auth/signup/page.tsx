import type { Metadata } from "next";
import { SignupForm } from "@/components/forms/SignupForm";

export const metadata: Metadata = { title: "Create Account" };

export default function SignupPage() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <h1 className="mb-1 text-2xl font-bold text-slate-900 dark:text-slate-100">Create your account</h1>
      <p className="mb-6 text-sm text-slate-500">Join Nova — sustainable commerce for Sierra Leone</p>
      <SignupForm />
    </div>
  );
}
