import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlobalSearchDialog } from "@/components/commerce/SearchBar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <GlobalSearchDialog />
      <div className="mx-auto w-full max-w-7xl px-4 lg:px-6">{children}</div>
      <Footer />
    </div>
  );
}
