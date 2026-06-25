import { create } from "zustand";
import type { UserRole } from "@/types/domain";

interface AuthState {
  token: string | null;
  role: UserRole;
  setSession: (token: string, role: UserRole) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  role: "guest",
  setSession: (token, role) => set({ token, role }),
  clearSession: () => set({ token: null, role: "guest" }),
}));
