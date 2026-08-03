import type { Viewport } from "next";
import { IBM_Plex_Mono, Inter } from "next/font/google";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import type { ReactNode } from "react";

import { sessionSchema, type Session } from "@nova/auth";

import { LOCALES, COOKIE_KEYS } from "@/config/app";
import { buildMetadata } from "@/lib/metadata";
import { AppProviders } from "@/providers";
import type { Theme } from "@/providers/theme-provider";
import "../globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata = buildMetadata();

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#126b4f",
};

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

  let initialSession: Session | null = null;

  if (rawSession) {
    try {
      initialSession = sessionSchema.parse(JSON.parse(decodeURIComponent(rawSession)));
    } catch {
      initialSession = null;
    }
  }

  const direction = locale === "ar" ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={direction}
      className={rawTheme === "dark" ? "dark" : ""}
      suppressHydrationWarning
    >
      <body
        className={`${inter.variable} ${mono.variable} min-h-screen bg-[color:var(--ds-background)] font-sans text-[color:var(--ds-text)] antialiased`}
      >
        <NextIntlClientProvider messages={messages} locale={locale}>
          <AppProviders initialSession={initialSession} initialTheme={rawTheme}>
            {children}
          </AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
