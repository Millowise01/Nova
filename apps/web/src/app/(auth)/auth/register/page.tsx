import { MainLayout } from "@/components/layouts";
import { ModuleScreen } from "@/features/shared/components";
import { moduleMap } from "@/features/docs/module-map";

export default function RegisterPage() {
  return (
    <MainLayout>
      <ModuleScreen
        breadcrumb={[{ href: "/", label: "Home" }, { href: "/auth/register", label: "Register" }]}
        cards={moduleMap.auth}
        subtitle="Registration module covers onboarding, verification, activation, and guest fallback paths."
        title="Create Account"
      />
    </MainLayout>
  );
}
import { RegisterForm } from "@/features/auth/components/register-form";

export default function RegisterPage() {
  return <RegisterForm />;
}
