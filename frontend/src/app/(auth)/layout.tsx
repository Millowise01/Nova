import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold text-primary">Nova</Link>
        <Link href="/catalog" className="text-sm text-slate-600 hover:text-primary dark:text-slate-400">Browse Store</Link>
      </header>
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md">{children}</div>
      </main>
      <footer className="py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Nova Commerce
      </footer>
    </div>
  );
}
