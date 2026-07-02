import { Skeleton } from "@nova/ui";

export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-7xl space-y-4 px-4 py-8 md:px-6 lg:px-8">
      <Skeleton className="h-12 w-64" />
      <Skeleton className="h-40 w-full" />
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </main>
  );
}
