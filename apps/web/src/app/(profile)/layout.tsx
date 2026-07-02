import type { PropsWithChildren } from "react";
import { ProfileLayout } from "@/components/layouts";

export default function ProfileGroupLayout({ children }: PropsWithChildren) {
  return <ProfileLayout>{children}</ProfileLayout>;
}
