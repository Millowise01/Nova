import type { PropsWithChildren } from "react";
import { SearchLayout } from "@/components/layouts";

export default function SearchGroupLayout({ children }: PropsWithChildren) {
  return <SearchLayout>{children}</SearchLayout>;
}
