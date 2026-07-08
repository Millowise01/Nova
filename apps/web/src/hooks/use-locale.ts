"use client";

import { useLocale } from "next-intl";
import { RTL_LOCALES, type Locale } from "@/config/app";

export function useAppLocale() {
  const locale = useLocale() as Locale;
  const isRTL = (RTL_LOCALES as string[]).includes(locale);

  return { locale, isRTL, dir: isRTL ? ("rtl" as const) : ("ltr" as const) };
}
