import { create } from "zustand";

interface UiState {
  globalSearchOpen: boolean;
  theme: "light" | "dark";
  setGlobalSearchOpen: (open: boolean) => void;
  toggleTheme: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  globalSearchOpen: false,
  theme: "light",
  setGlobalSearchOpen: (globalSearchOpen) => set({ globalSearchOpen }),
  toggleTheme: () => set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),
}));
