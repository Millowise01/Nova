import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { AppShell } from '@/components/layout/AppShell';
import { login } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';

export function LoginPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      const session = await login({ identifier, password });
      setSession({ accessToken: session.accessToken, user: session.user });
      toast.success(`Welcome back, ${session.user.name}`);
      const role = session.user.role;
      if (role === 'ADMIN') navigate('/admin/dashboard');
      else if (role === 'SELLER') navigate('/seller/dashboard');
      else navigate('/home');
    } catch {
      toast.error('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <section className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:px-8">
        <div className="nova-card p-8">
          <h1 className="text-3xl font-bold text-gray-900">Login</h1>
          <p className="mt-1 text-sm text-gray-600">Welcome back to Nova.</p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block space-y-2 text-sm font-medium text-gray-700">
              <span>Email or phone</span>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                autoComplete="username"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none ring-brand-500 focus:ring-2"
                placeholder="you@example.com"
              />
            </label>
            <label className="block space-y-2 text-sm font-medium text-gray-700">
              <span>Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none ring-brand-500 focus:ring-2"
                placeholder="••••••••"
              />
            </label>
            <div className="flex items-center justify-between text-sm">
              <Link to="/register" className="text-brand-700 hover:underline">
                Create an account
              </Link>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="nova-button-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </section>
    </AppShell>
  );
}
