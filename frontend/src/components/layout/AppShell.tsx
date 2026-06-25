import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="text-lg font-extrabold tracking-tight text-brand-700">
            Nova
          </Link>
          <nav className="flex items-center gap-3 text-sm font-medium text-gray-700">
            <Link to="/login">Login</Link>
            <Link to="/register" className="rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-700">
              Register
            </Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}