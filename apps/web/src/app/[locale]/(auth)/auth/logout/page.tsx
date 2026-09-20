import Link from "next/link";

import { Button, Card } from "@nova/ui";

export default function LogoutPage() {
  return (
    <Card className="w-full space-y-4 rounded-xl p-6">
      <h1 className="text-2xl font-bold tracking-tight text-[color:var(--color-foreground)]">
        You are signed out
      </h1>
      <p className="text-sm text-[color:var(--color-foreground-muted)]">
        Your session has ended successfully.
      </p>
      <Link href="/auth/login">
        <Button>Sign in again</Button>
      </Link>
    </Card>
  );
}
