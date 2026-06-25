import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, UserRole } from "@/types/domain";

interface AuthState {
  token: string | null;
  user: User | null;
  role: UserRole;
  setSession: (token: string, user: User) => void;
  setUser: (user: User) => void;
  clearSession: () => void;
  isAuthenticated: boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      role: "guest",
      isAuthenticated: false,
      setSession: (token, user) => {
        if (typeof document !== "undefined") {
          document.cookie = `nova_token=${token}; path=/; max-age=86400; SameSite=Lax`;
          document.cookie = `nova_role=${user.role}; path=/; max-age=86400; SameSite=Lax`;
        }
        set({ token, user, role: user.role as UserRole, isAuthenticated: true });
      },
      setUser: (user) => set({ user, role: user.role as UserRole }),
      clearSession: () => {
        if (typeof document !== "undefined") {
          document.cookie = "nova_token=; path=/; max-age=0";
          document.cookie = "nova_role=; path=/; max-age=0";
        }
        set({ token: null, user: null, role: "guest", isAuthenticated: false });
      },
    }),
    { name: "nova-auth", partialize: (state) => ({ token: state.token, user: state.user, role: state.role, isAuthenticated: state.isAuthenticated }) },
  ),
);
