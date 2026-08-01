"use client";

import { createContext, useContext, useEffect } from "react";
import type { ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackEvent } from "@nova/analytics";

type AnalyticsContextType = {
  track: (name: string, properties?: Record<string, string | number | boolean>) => void;
};

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const track = (name: string, properties?: Record<string, string | number | boolean>) => {
    trackEvent({ name, properties });
    if (process.env.NODE_ENV === "development") {
      console.log(`[Analytics] Event: "${name}"`, properties);
    }
  };

  useEffect(() => {
    track("page_view", {
      path: pathname,
      search: searchParams?.toString() || "",
    });
  }, [pathname, searchParams]);

  return <AnalyticsContext.Provider value={{ track }}>{children}</AnalyticsContext.Provider>;
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context) throw new Error("useAnalytics must be used within AnalyticsProvider");
  return context;
}
