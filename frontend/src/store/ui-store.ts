import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UiState {
  globalSearchOpen: boolean;
  mobileMenuOpen: boolean;
  cartDrawerOpen: boolean;
  theme: "light" | "dark";
  locale: "en" | "kri";
  setGlobalSearchOpen: (open: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  setCartDrawerOpen: (open: boolean) => void;
  toggleTheme: () => void;
  setLocale: (locale: "en" | "kri") => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      globalSearchOpen: false,
      mobileMenuOpen: false,
      cartDrawerOpen: false,
      theme: "light",
      locale: "en",
      setGlobalSearchOpen: (globalSearchOpen) => set({ globalSearchOpen }),
      setMobileMenuOpen: (mobileMenuOpen) => set({ mobileMenuOpen }),
      setCartDrawerOpen: (cartDrawerOpen) => set({ cartDrawerOpen }),
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),
      setLocale: (locale) => set({ locale }),
    }),
    { name: "nova-ui", partialize: (state) => ({ theme: state.theme, locale: state.locale }) },
  ),
);
