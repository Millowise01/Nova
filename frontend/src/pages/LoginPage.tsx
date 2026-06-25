import { AppShell } from '@/components/layout/AppShell';

export function LoginPage() {
  return (
    <AppShell>
      <section className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="nova-card p-8">
          <h1 className="text-3xl font-bold text-gray-900">Login</h1>
          <p className="mt-2 text-gray-600">Frontend route ready for the real auth flow.</p>
        </div>
      </section>
    </AppShell>
  );
}