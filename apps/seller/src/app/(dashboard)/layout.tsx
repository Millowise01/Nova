"use client";

import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";

import {
  Button,
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarHeader,
  SidebarItem,
  SidebarSection,
} from "@nova/ui";

import { useAuth } from "@/providers/auth-provider";

// Grows as each S-3..S-8 ticket adds a real route — kept empty of links to
// pages that don't exist yet, same discipline as not linking to unbuilt
// screens anywhere else in this build.
const NAV_SECTIONS: { label: string; items: { href: string; label: string }[] }[] = [
  {
    label: "Account",
    items: [{ href: "/kyc", label: "Verification (KYC)" }],
  },
  {
    label: "Catalog",
    items: [{ href: "/catalog", label: "Products" }],
  },
  {
    label: "Insights",
    items: [{ href: "/analytics", label: "Analytics" }],
  },
];

/** Mirrors apps/admin/src/app/(dashboard)/layout.tsx's shell exactly. Section
 *  headers (once NAV_SECTIONS is filled in) are information architecture only,
 *  not access control — every seller can reach every screen here, same
 *  disclosed role-model gap as apps/admin (backend/docs/05-security-
 *  baseline.md: no sub-role distinction exists to gate visibility on). */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, logout } = useAuth();

  return (
    <div className="flex min-h-screen">
      <Sidebar>
        <SidebarHeader>
          <p className="text-sm font-semibold text-[color:var(--color-foreground)]">Nova Seller</p>
        </SidebarHeader>
        <SidebarBody>
          {NAV_SECTIONS.map((section) => (
            <SidebarSection key={section.label} label={section.label}>
              {section.items.map((item) => (
                <SidebarItem
                  key={item.href}
                  href={item.href}
                  active={pathname.startsWith(item.href)}
                  onClick={(event) => {
                    event.preventDefault();
                    router.push(item.href);
                  }}
                >
                  {item.label}
                </SidebarItem>
              ))}
            </SidebarSection>
          ))}
        </SidebarBody>
        <SidebarFooter>
          <p className="truncate px-3 text-xs text-[color:var(--color-foreground-muted)]">
            {session?.userId}
          </p>
          <Button variant="ghost" size="sm" fullWidth onClick={() => logout()}>
            Sign out
          </Button>
        </SidebarFooter>
      </Sidebar>

      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
