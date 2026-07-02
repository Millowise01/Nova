import type { PropsWithChildren } from "react";
import { AuthLayout } from "@/components/layouts";

export default function AuthGroupLayout({ children }: PropsWithChildren) {
  return <AuthLayout>{children}</AuthLayout>;
}
