import type { PropsWithChildren } from "react";
import { DashboardLayout } from "@/components/layouts";
import { AuthGuard } from "@/components/auth-guard";

export default function DashboardGroupLayout({ children }: PropsWithChildren) {
  return (
    <AuthGuard>
      <DashboardLayout>{children}</DashboardLayout>
    </AuthGuard>
  );
}
