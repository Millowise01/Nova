import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { IBM_Plex_Mono, Inter } from "next/font/google";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { APP_NAME } from "@nova/constants";
import { AppProviders } from "@/providers";
import type { Theme } from "@/providers/theme-provider";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans"
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono"
});

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`
  },
  description: "Nova customer commerce experience for Sierra Leone",
  openGraph: {
    title: APP_NAME,
    description: "Trusted digital commerce ecosystem for customers across Sierra Leone",
    type: "website",
    siteName: APP_NAME,
    locale: "en_US"
  },
  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description: "Trusted digital commerce ecosystem for customers across Sierra Leone"
  },
  robots: {
    index: true,
    follow: true
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#126b4f"
};

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  // Validate locale
  const locales = ["en", "fr", "ar"];
  if (!locales.includes(locale)) {
    notFound();
  }

  // Fetch translation messages
  const messages = await getMessages();

  // Read cookies for SSR theme & session synchronization
  const cookieStore = await cookies();
  const rawSession = cookieStore.get("nova_session")?.value;
  const rawTheme = cookieStore.get("nova_theme")?.value as Theme | undefined;

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
    <html lang={locale} dir={direction} className={rawTheme === "dark" ? "dark" : ""}>
      <body className={`${inter.variable} ${mono.variable} font-sans antialiased bg-[color:var(--ds-background)] text-[color:var(--ds-text)] min-h-screen`}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <AppProviders initialSession={initialSession} initialTheme={rawTheme}>
            {children}
          </AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
