import type { PropsWithChildren } from "react";

import { AuthGuard } from "@/components/auth-guard";
import { CheckoutLayout } from "@/components/layouts";

export default function CheckoutGroupLayout({ children }: PropsWithChildren) {
  return (
    <AuthGuard>
      <CheckoutLayout>{children}</CheckoutLayout>
    </AuthGuard>
  );
}
