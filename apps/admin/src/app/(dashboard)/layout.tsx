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

const NAV_SECTIONS = [
  {
    label: "Trust & Safety",
    items: [
      { href: "/sellers", label: "Seller Approval & Suspension" },
      { href: "/disputes", label: "Dispute Resolution" },
    ],
  },
  {
    label: "Finance",
    items: [{ href: "/finance", label: "Refunds & Payouts" }],
  },
];

/** These section headers are information architecture only, borrowed from Volume 6's
 *  category names — NOT access control. Every admin can reach every screen; there is
 *  no sub-role in this codebase to gate visibility on (backend/docs/05-security-
 *  baseline.md's disclosed role-model gap). Don't add role-based hiding here later
 *  without a real role model behind it. */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, logout } = useAuth();

  return (
    <div className="flex min-h-screen">
      <Sidebar>
        <SidebarHeader>
          <p className="text-sm font-semibold text-[color:var(--color-foreground)]">Nova Admin</p>
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
