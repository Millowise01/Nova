import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter } from "next/font/google";
import { cookies } from "next/headers";
import type { ReactNode } from "react";

import { parseSessionCookieValue } from "@nova/app-shell";

import { COOKIE_KEYS } from "@/config/app";
import { AppProviders } from "@/providers";
import type { Theme } from "@/providers/theme-provider";

import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });

export const metadata: Metadata = { title: "Nova Seller" };

export default async function SellerLayout({ children }: Readonly<{ children: ReactNode }>) {
  const cookieStore = await cookies();
  const rawSession = cookieStore.get(COOKIE_KEYS.session)?.value;
  const rawTheme = cookieStore.get(COOKIE_KEYS.theme)?.value as Theme | undefined;

  const initialSession = parseSessionCookieValue(rawSession);

  return (
    <html lang="en">
      <body className={`${inter.variable} ${mono.variable}`}>
        <AppProviders initialSession={initialSession} initialTheme={rawTheme}>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
