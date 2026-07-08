import type { PropsWithChildren } from "react";
import { MainLayout } from "@/components/layouts";

export default function SearchGroupLayout({ children }: PropsWithChildren) {
  return <MainLayout>{children}</MainLayout>;
}
