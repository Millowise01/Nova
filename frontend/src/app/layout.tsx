import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/providers/Providers";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Nova — Sustainable Commerce in Sierra Leone",
    template: "%s | Nova",
  },
  description:
    "Discover eco-certified products, support local sellers, and shop sustainably on Nova — Sierra Leone's leading e-commerce platform.",
  keywords: ["e-commerce", "Sierra Leone", "sustainable", "eco", "West Africa", "Nova"],
  authors: [{ name: "Nova Commerce" }],
  creator: "Nova Commerce",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://nova.sl",
  ),
  openGraph: {
    type: "website",
    locale: "en_SL",
    title: "Nova — Sustainable Commerce",
    description: "Trusted, fast, and eco-conscious shopping for Sierra Leone.",
    siteName: "Nova",
  },
  twitter: { card: "summary_large_image", title: "Nova Commerce", description: "Sustainable shopping for Sierra Leone." },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0E7A45",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
