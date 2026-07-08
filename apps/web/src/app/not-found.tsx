import Link from "next/link";

export default function RootNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-xl font-semibold text-slate-900">Page not found</h1>
      <p className="max-w-sm text-sm text-slate-500">
        The page you are looking for does not exist.
      </p>
      <Link
        href="/en"
        className="rounded-lg bg-[#126b4f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0f5a41] transition"
      >
        Go to Homepage
      </Link>
    </div>
  );
}
