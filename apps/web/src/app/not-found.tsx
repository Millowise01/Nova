import Link from "next/link";
import { Button, EmptyState } from "@nova/ui";

export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-xl px-4 py-16 md:px-6">
      <EmptyState>
        <h1 className="text-xl font-semibold">Page not found</h1>
        <p className="mt-2 text-sm text-slate-600">The page you are looking for no longer exists or was moved.</p>
        <Link href="/">
          <Button>Go to Homepage</Button>
        </Link>
      </EmptyState>
    </main>
  );
}
