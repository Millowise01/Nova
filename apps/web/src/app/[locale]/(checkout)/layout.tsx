import type { PropsWithChildren } from "react";
import { CheckoutLayout } from "@/components/layouts";
import { AuthGuard } from "@/components/auth-guard";

export default function CheckoutGroupLayout({ children }: PropsWithChildren) {
  return (
    <AuthGuard>
      <CheckoutLayout>{children}</CheckoutLayout>
    </AuthGuard>
  );
}
