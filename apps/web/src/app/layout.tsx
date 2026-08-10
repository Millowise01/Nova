import type { Viewport } from "next";
import { IBM_Plex_Mono, Inter } from "next/font/google";
import { cookies } from "next/headers";
import { getLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { COOKIE_KEYS, RTL_LOCALES, type Locale } from "@/config/app";
import { buildMetadata } from "@/lib/metadata";
import type { Theme } from "@/providers/theme-provider";

import "./globals.css";

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

/**
 * The ONE place <html>/<body> are allowed to exist (Next.js App Router requires
 * exactly one root-defining layout — a nested layout that ALSO renders <html>/<body>,
 * as [locale]/layout.tsx previously did, produces an invalid duplicate-root DOM
 * structure. Browsers merge the second <body>'s attributes onto the first per the
 * HTML5 parsing spec, while React's hydration walk doesn't expect that merge — the
 * className (font variables + background/text-color utility classes) ends up applied
 * only after React's mismatch-recovery pass runs client-side, which is what produced
 * both the hydration warning AND the pre-hydration invisible-contrast flash (body had
 * no background/text-color classes until then).
 *
 * getLocale() (not the [locale] route param) is what makes this safe to compute here:
 * it reads the same per-request locale next-intl's middleware already resolves,
 * independent of which layout file calls it — so /offline and /api/health (which sit
 * outside the [locale] segment) still get a valid lang/dir instead of needing this
 * layout to special-case them.
 */
export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  const cookieStore = await cookies();
  const rawTheme = cookieStore.get(COOKIE_KEYS.theme)?.value as Theme | undefined;

  const direction = RTL_LOCALES.includes(locale as Locale) ? "rtl" : "ltr";

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
        {children}
      </body>
    </html>
  );
}
