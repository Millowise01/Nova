import type { ReactNode } from "react";

import { BreadcrumbNav } from "@/features/navigation/components";
import { FeatureGrid, ModuleShell } from "@/features/shared/components";
import type { ModuleCard } from "@/types/domain";

export function ModuleScreen({
  title,
  subtitle,
  cards,
  breadcrumb,
  actions,
}: {
  title: string;
  subtitle: string;
  cards: ModuleCard[];
  breadcrumb: Array<{ href: string; label: string }>;
  actions?: ReactNode;
}) {
  return (
    <ModuleShell actions={actions} subtitle={subtitle} title={title}>
      <BreadcrumbNav items={breadcrumb} />
      <FeatureGrid items={cards} />
    </ModuleShell>
  );
}
