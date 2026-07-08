import type { PropsWithChildren } from "react";
import { DashboardLayout } from "@/components/layouts";

export default function DashboardGroupLayout({ children }: PropsWithChildren) {
  return <DashboardLayout>{children}</DashboardLayout>;
}

