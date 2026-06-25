import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlobalSearchDialog } from "@/components/commerce/SearchBar";

export function AppShell({ children, fullWidth = false }: { children: React.ReactNode; fullWidth?: boolean }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />
      <GlobalSearchDialog />
      <div className={fullWidth ? "w-full" : "mx-auto w-full max-w-7xl flex-1 px-4 py-8 lg:px-6"}>
        {children}
      </div>
      <Footer />
    </div>
  );
}
