import type { Metadata } from "next";

import { APP_NAME } from "@nova/constants";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://nova.example.com";
const BASE_DESCRIPTION = "Trusted digital commerce ecosystem for customers across Sierra Leone.";

export function buildMetadata(overrides: Partial<Metadata> = {}): Metadata {
  const title = overrides.title ?? APP_NAME;
  const description = (overrides.description as string) ?? BASE_DESCRIPTION;

  return {
    metadataBase: new URL(BASE_URL),
    title,
    description,
    openGraph: {
      title: typeof title === "string" ? title : APP_NAME,
      description,
      type: "website",
      siteName: APP_NAME,
      ...(overrides.openGraph ?? {}),
    },
    twitter: {
      card: "summary_large_image",
      title: typeof title === "string" ? title : APP_NAME,
      description,
      ...(overrides.twitter ?? {}),
    },
    robots: { index: true, follow: true },
    ...overrides,
  };
}
