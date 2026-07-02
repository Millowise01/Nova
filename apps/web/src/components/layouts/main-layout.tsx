import type { PropsWithChildren } from "react";
import { AnnouncementBar } from "@/features/navigation/components/announcement-bar";
import { MainFooter } from "@/features/navigation/components/main-footer";
import { MainHeader } from "@/features/navigation/components/main-header";

export function MainLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-[color:var(--ds-background)] text-[color:var(--ds-text)]">
      <AnnouncementBar />
      <MainHeader />
      <main>{children}</main>
      <MainFooter />
    </div>
  );
}
