import type { PropsWithChildren } from "react";
import { CheckoutLayout } from "@/components/layouts";

export default function CheckoutGroupLayout({ children }: PropsWithChildren) {
  return <CheckoutLayout>{children}</CheckoutLayout>;
}
