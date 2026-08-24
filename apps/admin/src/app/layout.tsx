import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter } from "next/font/google";
import { cookies } from "next/headers";
import type { ReactNode } from "react";

import { type Session, sessionSchema } from "@nova/auth";

import { COOKIE_KEYS } from "@/config/app";
import { AppProviders } from "@/providers";
import type { Theme } from "@/providers/theme-provider";

import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });

export const metadata: Metadata = { title: "Nova Admin" };

export default async function AdminLayout({ children }: Readonly<{ children: ReactNode }>) {
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
