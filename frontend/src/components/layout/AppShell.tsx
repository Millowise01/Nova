import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { logout } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const clearCart = useCartStore((state) => state.clearCart);
  const cartCount = useCartStore((state) => state.getItemCount());

  async function handleLogout() {
    try {
      await logout();
    } catch {
      // proceed regardless
    }
    clearSession();
    clearCart();
    toast.success('Signed out');
    navigate('/');
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="text-lg font-extrabold tracking-tight text-brand-700">
            Nova
          </Link>
          <nav className="flex items-center gap-3 text-sm font-medium text-gray-700">
            {user ? (
              <>
                <Link to="/home">Home</Link>
                <Link to="/search">Search</Link>
                {user.role === 'SELLER' && (
                  <Link to="/seller/dashboard">Seller</Link>
                )}
                {user.role === 'ADMIN' && (
                  <Link to="/admin/dashboard">Admin</Link>
                )}
                <Link to="/cart" className="relative">
                  Cart
                  {cartCount > 0 && (
                    <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-xs text-white">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <Link to="/profile">{user.name.split(' ')[0]}</Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="nova-button-secondary"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register" className="nova-button-primary">
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
