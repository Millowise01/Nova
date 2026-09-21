import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import type { ReactNode } from "react";

import { parseSessionCookieValue } from "@nova/app-shell";

import { LOCALES, COOKIE_KEYS } from "@/config/app";
import { AppProviders } from "@/providers";
import type { Theme } from "@/providers/theme-provider";

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!(LOCALES as readonly string[]).includes(locale)) {
    notFound();
  }

  const messages = await getMessages();
  const cookieStore = await cookies();
  const rawSession = cookieStore.get(COOKIE_KEYS.session)?.value;
  const rawTheme = cookieStore.get(COOKIE_KEYS.theme)?.value as Theme | undefined;

  const initialSession = parseSessionCookieValue(rawSession);

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <AppProviders initialSession={initialSession} initialTheme={rawTheme}>
        {children}
      </AppProviders>
    </NextIntlClientProvider>
  );
}
