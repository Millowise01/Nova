import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { AppShell } from '@/components/layout/AppShell';
import { register } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';

export function RegisterPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'CUSTOMER' | 'SELLER'>('CUSTOMER');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      const session = await register({ name, email, phone, password, role });
      setSession({ accessToken: session.accessToken, user: session.user });
      toast.success(`Account created! Welcome, ${session.user.name}`);
      if (role === 'SELLER') navigate('/seller/dashboard');
      else navigate('/home');
    } catch {
      toast.error('Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <section className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:px-8">
        <div className="nova-card p-8">
          <h1 className="text-3xl font-bold text-gray-900">Create account</h1>
          <p className="mt-1 text-sm text-gray-600">Join Nova to start shopping or selling.</p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block space-y-2 text-sm font-medium text-gray-700">
              <span>Full name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none ring-brand-500 focus:ring-2"
                placeholder="Your name"
              />
            </label>
            <label className="block space-y-2 text-sm font-medium text-gray-700">
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none ring-brand-500 focus:ring-2"
                placeholder="you@example.com"
              />
            </label>
            <label className="block space-y-2 text-sm font-medium text-gray-700">
              <span>Phone</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                autoComplete="tel"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none ring-brand-500 focus:ring-2"
                placeholder="+232 76 000 000"
              />
            </label>
            <label className="block space-y-2 text-sm font-medium text-gray-700">
              <span>Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none ring-brand-500 focus:ring-2"
                placeholder="••••••••"
              />
            </label>
            <div className="space-y-2 text-sm font-medium text-gray-700">
              <span>I want to</span>
              <div className="grid grid-cols-2 gap-3">
                {(['CUSTOMER', 'SELLER'] as const).map((value) => (
                  <label
                    key={value}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition ${role === value ? 'border-brand-500 bg-brand-50' : 'border-gray-200'}`}
                  >
                    <input
                      type="radio"
                      name="role"
                      checked={role === value}
                      onChange={() => setRole(value)}
                      className="accent-brand-500"
                    />
                    <span>{value === 'CUSTOMER' ? 'Shop' : 'Sell'}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <Link to="/login" className="text-brand-700 hover:underline">
                Already have an account?
              </Link>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="nova-button-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </div>
      </section>
    </AppShell>
  );
}
