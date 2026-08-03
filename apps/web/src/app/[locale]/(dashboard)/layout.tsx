import type { PropsWithChildren } from "react";

import { AuthGuard } from "@/components/auth-guard";
import { DashboardLayout } from "@/components/layouts";

export default function DashboardGroupLayout({ children }: PropsWithChildren) {
  return (
    <AuthGuard>
      <DashboardLayout>{children}</DashboardLayout>
    </AuthGuard>
  );
}
