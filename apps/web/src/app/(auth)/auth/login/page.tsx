import { MainLayout } from "@/components/layouts";
import { ModuleScreen } from "@/features/shared/components";
import { moduleMap } from "@/features/docs/module-map";

export default function LoginPage() {
  return (
    <MainLayout>
      <ModuleScreen
        breadcrumb={[{ href: "/", label: "Home" }, { href: "/auth/login", label: "Login" }]}
        cards={moduleMap.auth}
        subtitle="Authentication and account access workflows are implemented through shared auth contracts and validated forms."
        title="Customer Authentication"
      />
    </MainLayout>
  );
}
import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return <LoginForm />;
}
