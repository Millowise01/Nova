"use client";

import { useEffect, type PropsWithChildren } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Spinner } from "@nova/ui";
import { useAuth } from "@/providers";
import { ROUTES } from "@/config/routes";

export function AuthGuard({ children }: PropsWithChildren) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const loginPath = `${ROUTES.login}?redirect=${encodeURIComponent(pathname)}`;
      router.replace(loginPath);
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="h-6 w-6 text-[color:var(--ds-primary)]" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
