import { create } from 'zustand';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'SELLER' | 'ADMIN';
};

type AuthState = {
  accessToken: string | null;
  user: User | null;
  setAccessToken: (accessToken: string | null) => void;
  setUser: (user: User | null) => void;
  setSession: (session: { accessToken: string; user: User }) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  setAccessToken: (accessToken) => set({ accessToken }),
  setUser: (user) => set({ user }),
  setSession: ({ accessToken, user }) => set({ accessToken, user }),
  clearSession: () => set({ accessToken: null, user: null }),
}));