import { MainLayout } from "@/components/layouts";
import { ModuleScreen } from "@/features/shared/components";
import { moduleMap } from "@/features/docs/module-map";

export default function SearchPage() {
  return (
    <MainLayout>
      <ModuleScreen
        breadcrumb={[{ href: "/", label: "Home" }, { href: "/search", label: "Search" }]}
        cards={moduleMap.search}
        subtitle="Enterprise search with instant suggestions, history, trends, and category-aware discovery."
        title="Search Experience"
      />
    </MainLayout>
  );
}
import { MainLayout } from "@/components/layouts";
import { SearchScreen } from "@/features/search/components/search-screen";

export default function SearchPage() {
  return (
    <MainLayout>
      <SearchScreen />
    </MainLayout>
  );
}
