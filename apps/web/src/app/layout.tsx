import type { ReactNode } from "react";

/**
 * Root layout — minimal shell required by Next.js App Router.
 * The real HTML/body/providers live in [locale]/layout.tsx.
 * This wrapper satisfies the framework contract for the root segment.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
