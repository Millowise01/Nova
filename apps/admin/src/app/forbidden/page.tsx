export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2 px-4 text-center">
      <h1 className="text-lg font-semibold text-[color:var(--color-foreground)]">
        You don&apos;t have access to Nova Admin
      </h1>
      <p className="text-sm text-[color:var(--color-foreground-muted)]">
        This portal requires an admin account.
      </p>
    </div>
  );
}
