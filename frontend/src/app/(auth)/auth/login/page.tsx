import { LoginForm } from "@/components/forms/LoginForm";

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-md py-8">
      <h1 className="mb-4 text-3xl font-bold">Login</h1>
      <LoginForm />
      <div className="mt-4 rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-700">
        <p className="font-medium">Social Login UI</p>
        <p className="text-slate-600">Google, Apple, and regional identity providers will connect here.</p>
      </div>
    </main>
  );
}
