import { AlertTriangle, PackageOpen } from "lucide-react";

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
      <PackageOpen className="mx-auto mb-2" />
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{message}</p>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900 dark:bg-red-950/30">
      <div className="flex items-center gap-2">
        <AlertTriangle size={16} />
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  );
}

export function LoadingState() {
  return <div className="h-32 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />;
}
