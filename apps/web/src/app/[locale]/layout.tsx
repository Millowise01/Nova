import type { Viewport } from "next";
import type { ReactNode } from "react";
import { IBM_Plex_Mono, Inter } from "next/font/google";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { AppProviders } from "@/providers";
import type { Theme } from "@/providers/theme-provider";
import { buildMetadata } from "@/lib/metadata";
import { LOCALES, COOKIE_KEYS } from "@/config/app";
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

  let initialSession = null;
  if (rawSession) {
    try {
      initialSession = JSON.parse(decodeURIComponent(rawSession));
    } catch {
      // Ignore corrupt session cookie
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
        className={`${inter.variable} ${mono.variable} font-sans antialiased bg-[color:var(--ds-background)] text-[color:var(--ds-text)] min-h-screen`}
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
